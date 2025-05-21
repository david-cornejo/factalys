const { parsePeriodFromHtml } = require('../utils/htmlDateParser');
const clientesServicios = require('../service/clienteService');
const { config } = require('../config/config');
const { models } = require('../libs/sequelize');
const Facturapi = require('facturapi');
const ExcelJS = require('exceljs');
const moment = require('moment');
const { type } = require('os');
const fs = require('fs');
const path = require('path');

const clienteServicio = new clientesServicios();
const facturapi = new Facturapi(config.facturApi);
const logoPath = path.join(__dirname, '../assets/Logo Horizonta con fondo.png');

class facturacionServicios {
  async newFacture(data) {
    const invoice = await facturapi.invoices.create(data);
    return invoice;
  }
  
  async newDocumentoDB(data, asesores = [], id_factura_origen = null, fecha_pago = null) {
    const {
      estadoDePago,
      id_facturacion,
      id_cliente,
      id_usuario_creador,
      id_sucursal,
      contrato,
      serieSucursal,
      tipo_factura,
      total,
      folio,
      fecha_emision,
      fecha_inicio,
      fecha_fin,
    } = data;
  
    const atendida = ['SP', 'VP', 'REP', 'NC', 'PDC'].includes(estadoDePago);
  
    const commonData = {
      id_facturacion,
      fecha_emision,
      total,
      tipo_factura,
      estadoDePago,
      folio,
      serieSucursal,
      contrato,
      atendida,
      fecha_inicio,
      fecha_fin,
      id_cliente,
      id_usuario_creador,
      id_sucursal,
    };
  
    if (['SP', 'VP', 'VN', 'SN'].includes(estadoDePago)) {
      const factura = await models.Facturacion.create(commonData);
  
      if (asesores.length > 0) {
        const asesoresRelacionados = await models.Asesor.findAll({
          where: { id_asesor: asesores },
        });
        await factura.addAsesores(asesoresRelacionados);
      }
  
      return factura;
    }
  
    // 🔹 Para documentos relacionados (REP, NC, PDC)
    if (['PDC', 'REP', 'NC'].includes(estadoDePago)) {
      if (!id_factura_origen) {
        throw new Error(
          `id_factura_origen es obligatorio para documentos ${estadoDePago}`
        );
      }
  
      // Para REP y NC, no usamos id_factura directamente, sino tabla intermedia
      const documento = {
        ...commonData,
      };
  
      if (estadoDePago === 'REP') {
        if (!fecha_pago) {
          throw new Error('fecha_pago es obligatoria para documentos REP');
        }
        documento.fecha_emision = fecha_pago;
  
        const rep = await models.Rep.create(documento);
  
        // Relación muchos a muchos con Facturación
        await rep.addFacturas(id_factura_origen); // Puede ser un ID o array
  
        return rep;
      }
  
      if (estadoDePago === 'NC') {
        const nota = await models.NotaCredito.create(documento);
  
        // Relación muchos a muchos con Facturación
        await nota.addFacturas(id_factura_origen); // Puede ser un ID o array
  
        return nota;
      }
  
      if (estadoDePago === 'PDC') {
        // ✅ Para pagos sí se deja el id_factura como FK directa
        documento.id_factura = id_factura_origen;
        return await models.Pago.create(documento);
      }
    }
  
    throw new Error(`Tipo de documento no válido: ${estadoDePago}`);
  }
  

  async findFactureAll() {
    //return config.facturApi;
    const factures = await facturapi.invoices.list();
    return factures;
  }

  async findFactureByCustumer(id, type) {
    const factures = await facturapi.invoices.list({
      customer: id,
      type: type,
    });
    return factures;
  }

  async allDocumentsByCustumer(id) {
    const factures = await facturapi.invoices.list({ customer: id });
    return factures;
  }

  async findFactureById(id) {
    const facture = await facturapi.invoices.retrieve(id);
    return facture;
  }

  async cancelarFactura(id, motive) {
    try {
      // 🔹 1. Cancelar la factura en Facturapi
      const cancelledFacture = await facturapi.invoices.cancel(id, { motive });

      let cancelledFactureDB;
      switch (cancelledFacture.type) {
        case 'E':
          cancelledFactureDB = await models.NotaCredito.findOne({
            where: { id_facturacion: id },
          });
          break;
        case 'P':
          cancelledFactureDB = await models.Rep.findOne({
            where: { id_facturacion: id },
          });
          break;
        case 'I':
          cancelledFactureDB = await models.Facturacion.findOne({
            where: { id_facturacion: id },
          });
          break;
        default:
          throw new Error(`Tipo de factura no válido: ${cancelledFacture.type}`);
      }

      if (!cancelledFactureDB) {
        throw new Error(`No se encontró la factura en la base de datos: ${id}`);
      }

      // 🔹 2. Descargar los nuevos archivos de la factura cancelada
      const pdfBuffer = await this.downloadFacturePdf(id);
      const xmlBuffer = await this.downloadFactureXml(id);

      // 🔹 3. Actualizar los archivos PDF y XML en la base de datos
      await models.PDF.update(
        { archivo: pdfBuffer },
        { where: { id_factura: id } }
      );

      await models.XML.update(
        { archivo: xmlBuffer },
        { where: { id_factura: id } }
      );

      // 🔹 4. Actualizar el estado de la factura y sus pagos relacionados
      const estadoDePago = cancelledFactureDB.estadoDePago;
      if (['SP', 'VP'].includes(estadoDePago)) {
        await models.Facturacion.update(
          { estado: 'cancelada' },
          { where: { id_facturacion: id } }
        );
        await models.Pago.update(
          { estado: 'cancelada' },
          { where: { id_factura: id } }
        );
      } else if (['VN', 'SN'].includes(estadoDePago)) {
        await models.Facturacion.update(
          { estado: 'cancelada' },
          { where: { id_facturacion: id } }
        );
      } else if (['REP'].includes(estadoDePago)) {
        await models.Rep.update(
          { estado: 'cancelada' },
          { where: { id_facturacion: id } }
        );
      } else if (['NC'].includes(estadoDePago)) {
        await models.NotaCredito.update(
          { estado: 'cancelada' },
          { where: { id_facturacion: id } }
        );
      }

      return {
        message: 'Factura cancelada y archivos actualizados',
        cancelledFacture,
      };
    } catch (error) {
      console.error(`Error al cancelar la factura ${id}:`, error);
      throw new Error(`No se pudo cancelar la factura: ${error.message}`);
    }
  }

  async copyFactureDraft(id) {
    const facture = await facturapi.invoices.copyToDraft(id);
    return facture;
  }

  async downloadFactureZip(id) {
    return await this._streamToBuffer(await facturapi.invoices.downloadZip(id));
  }

  async downloadFacturePdf(id) {
    return await this._streamToBuffer(await facturapi.invoices.downloadPdf(id));
  }

  async downloadFactureXml(id) {
    return await this._streamToBuffer(await facturapi.invoices.downloadXml(id));
  }

  async downloadCancellationReceiptPdf(id) {
    return await this._streamToBuffer(
      await facturapi.invoices.downloadCancellationReceiptPdf(id)
    );
  }

  async _streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }

  async dowloadAcuseCancelacionPDF(id) {
    try {
      const pdfStream = await facturapi.invoices.downloadCancellationReceiptPdf(
        id
      );
      const chunks = [];

      return new Promise((resolve, reject) => {
        pdfStream.on('data', (chunk) => chunks.push(chunk));
        pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
        pdfStream.on('error', (err) => reject(err));
      });
    } catch (error) {
      throw new Error(
        `Error al obtener el acuse de cancelación: ${error.message}`
      );
    }
  }

  async sendEmailFacure(id, emails) {
    try {
      const emailData = { email: emails }; // Facturapi permite recibir un array de correos

      const response = await facturapi.invoices.sendByEmail(id, emailData);

      return response;
    } catch (error) {
      console.error(`Error enviando email para la factura ${id}:`, error);
      throw new Error('No se pudo enviar el correo de la factura.');
    }
  }

  async calcularTotalesFacturacionYCobranza() {
    let totalFacturadoHistorico = 0;
    let totalFacturadoMensual = 0;
    let totalCobradoHistorico = 0;
    let totalCobradoMensual = 0;
  
    let page = 1;
    let hasMore = true;
  
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();
  
    try {
      while (hasMore) {
        const invoiceSearch = await facturapi.invoices.list({
          page: page,
          limit: 100,
        });
  
        invoiceSearch.data.forEach((invoice) => {
          if (invoice.status !== 'canceled') {
            const fecha = new Date(invoice.date);
            const esMesActual =
              fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
  
            // Total facturado
            totalFacturadoHistorico += invoice.total;
            if (esMesActual) totalFacturadoMensual += invoice.total;
  
            // Total cobrado
            const serie = invoice.series || '';
            const esPagada = ['VP', 'SP', 'REP', 'NC'].some((tag) => serie.includes(tag));
            if (esPagada) {
              totalCobradoHistorico += invoice.total;
              if (esMesActual) totalCobradoMensual += invoice.total;
            }
          }
        });
  
        hasMore = invoiceSearch.total_pages > page;
        page++;
      }
  
      return {
        facturado: {
          historico: totalFacturadoHistorico,
          mensual: totalFacturadoMensual,
        },
        cobrado: {
          historico: totalCobradoHistorico,
          mensual: totalCobradoMensual,
        },
      };
    } catch (error) {
      throw new Error(`Error al calcular totales: ${error.message}`);
    }
  }

  async totalesGraficas() {
    let page = 1;
    let hasMore = true;
  
    const dataPorMes = []; // Array en lugar de objeto
  
    const meses = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    try {
      while (hasMore) {
        const invoiceSearch = await facturapi.invoices.list({
          page: page,
          limit: 100,
        });
  
        invoiceSearch.data.forEach((invoice) => {
          if (invoice.status !== 'canceled') {
            const fecha = new Date(invoice.date);
            const mesIndex = fecha.getMonth();
            const anio = fecha.getFullYear();
  
            const serie = invoice.series || '';
            const esPagada = ['VP', 'SP', 'REP', 'NC'].some((tag) => serie.includes(tag));
  
            dataPorMes.push({
              year: anio,
              monthIndex: mesIndex,
              facturado: invoice.total,
              cobrado: esPagada ? invoice.total : 0,
            });
          }
        });
  
        hasMore = invoiceSearch.total_pages > page;
        page++;
      }
  
      // Agrupar por año y mes exacto
      const agrupado = {};
  
      for (const item of dataPorMes) {
        const clave = `${item.year}-${String(item.monthIndex).padStart(2, '0')}`;
        if (!agrupado[clave]) {
          agrupado[clave] = {
            year: item.year,
            monthIndex: item.monthIndex,
            facturado: 0,
            cobrado: 0,
          };
        }
        agrupado[clave].facturado += item.facturado;
        agrupado[clave].cobrado += item.cobrado;
      }
  
      // Convertir en arreglo y ordenar cronológicamente
      const chartData = Object.values(agrupado)
        .sort((a, b) => new Date(`${a.year}-${a.monthIndex + 1}-01`) - new Date(`${b.year}-${b.monthIndex + 1}-01`))
        .map((item) => ({
          month: meses[item.monthIndex], // 🔹 Solo el nombre del mes
          desktop: parseFloat(item.facturado.toFixed(2)),
          mobile: parseFloat(item.cobrado.toFixed(2)),
        }));
  
      return chartData;
    } catch (error) {
      throw new Error(`Error al calcular totales para gráficas: ${error.message}`);
    }
  }
  
  
  

  async findFacturesByFilters(filters = {}) {
    try {
      const { customer, types = [], date } = filters;
      const factures = [];
      if (types.length > 0) {
        for (const type of types) {
          const partialResult = await facturapi.invoices.list({
            customer,
            type,
            date,
          });
          factures.push(...partialResult.data);
        }
      } else {
        const generalResult = await facturapi.invoices.list({ customer, date });
        factures.push(...generalResult.data);
      }

      return factures;
    } catch (error) {
      throw new Error(`Error al buscar facturas: ${error.message}`);
    }
  }

  async findFactureByTypes(tipos) {
    const factures = [];
    for (const tipo of tipos) {
      const result = await facturapi.invoices.list({ type: tipo });
      factures.push(...result.data);
    }
    return factures;
  }

  async crearPDF(idFactura) {
    try {
      const pdfStream = await facturapi.invoices.downloadPdf(idFactura);
      const chunks = [];

      pdfStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      pdfStream.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks);

        await models.PDF.create({
          archivo: pdfBuffer,
          id_factura: idFactura,
        });
      });
    } catch (error) {
      throw new Error(`Error al crear el PDF: ${error.message}`);
    }
  }

  async crearXML(idFactura) {
    try {
      const pdfStream = await facturapi.invoices.downloadXml(idFactura);
      const chunks = [];

      pdfStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      pdfStream.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks);

        await models.XML.create({
          archivo: pdfBuffer,
          id_factura: idFactura,
        });
      });
    } catch (error) {
      throw new Error(`Error al crear el XML: ${error.message}`);
    }
  }

  async descargarFacturaZIP(id_factura) {
    try {
      const zipStream = await facturapi.invoices.downloadZip(id_factura);
      const filePath = `./factura_${id_factura}.zip`;
      const zipFile = fs.createWriteStream(filePath);

      zipStream.pipe(zipFile);

      return new Promise((resolve, reject) => {
        zipFile.on('finish', () => resolve(filePath));
        zipFile.on('error', (err) => reject(err));
      });
    } catch (error) {
      throw new Error(`Error al descargar el ZIP: ${error.message}`);
    }
  }

  async generarEstadoDeCuentaExcel(invoiceData , clienteFacturapiData) {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estado de Cuenta');

    // Ajustar anchos de columnas
    worksheet.getColumn(1).width = 17; // Emisión
    worksheet.getColumn(2).width = 13; // Serie
    worksheet.getColumn(3).width = 12; // Folio
    worksheet.getColumn(4).width = 14; // Concepto
    worksheet.getColumn(5).width = 20; // Cargo
    worksheet.getColumn(6).width = 20; // Abono
    worksheet.getColumn(7).width = 25; // Periodo
    worksheet.getColumn(8).width = 10; // Timbrado
    worksheet.getColumn(9).width = 2; // Para que funcione el merge en H1:I1, etc.

    // Borde delgado para reusar
    const thinBorder = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // === 1) LOGO A LA IZQUIERDA (A1:A2) ===
    const logoId = workbook.addImage({
      filename: logoPath,
      extension: 'png',
    });
    // Fusiona A1:A2 y coloca la imagen
    worksheet.mergeCells('A1:A2');
    worksheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      br: { col: 1, row: 2 },
    });

    // === 2) ENCABEZADO PRINCIPAL (fila 1: "Estado de Cuenta de...") ===
    //    - Título centrado en B1:F1
    //    - Notar que en tu código fusionas B1:F1
    const row1 = worksheet.getRow(1);
    row1.values = [
      '',
      `Estado de Cuenta de: ${clienteFacturapiData.legal_name || ''}`,
    ];
    // Para que se vea en la celda B1 y se extienda a F1
    worksheet.mergeCells('B1:F1');
    row1.height = 25;
    row1.font = { name: 'Helvetica', size: 14, bold: true };
    row1.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };

    // Aplícale un color de fondo (similar a tu screenshot)
    row1.eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 6) {
        cell.border = thinBorder;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2A4D69' }, // azul oscuro
        };
        cell.font = {
          name: 'Helvetica',
          size: 14,
          bold: true,
          color: { argb: 'FFFFFFFF' }, // texto blanco
        };
      }
    });

    // === 3) FILA 2: DATOS DEL CLIENTE (RFC, Correo, Tel, etc.) ===
    const row2 = worksheet.getRow(2);
    const rfc = clienteFacturapiData.tax_id || '';
    const correo = clienteFacturapiData.email || '';
    const tel = clienteFacturapiData.phone || '';
    let domicilio = '';
    if (
      clienteFacturapiData.address &&
      typeof clienteFacturapiData.address === 'object'
    ) {
      domicilio = Object.values(clienteFacturapiData.address)
        .filter(Boolean)
        .join(', ');
    } else if (clienteFacturapiData.address) {
      domicilio = clienteFacturapiData.address;
    }
    const regimenFiscal = clienteFacturapiData.tax_system || '';
    row2.values = [
      '',
      `RFC: ${rfc} | Correo: ${correo} | Tel: ${tel}\nRégimen: ${regimenFiscal} | Domicilio: ${domicilio}`,
    ];
    worksheet.mergeCells('B2:F2');
    row2.height = 30;
    row2.alignment = { horizontal: 'center', vertical: 'top', wrapText: true };

    // Si quieres el mismo color de fondo que la fila 1, aplícalo:
    row2.eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 6) {
        cell.border = thinBorder;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2A4D69' },
        };
        cell.font = {
          italic: true,
          size: 12,
          color: { argb: 'FFFFFFFF' },
        };
      }
    });

    // === Ajusta merges vacíos que estaban en tu código ===
    // Si no los necesitas, los puedes quitar o ajustar:
    worksheet.mergeCells('A3:F3');
    worksheet.mergeCells('A4:H4');

    // === 4) TOTALES (columnas G..I) EN FILAS 1..3 ===
    //    Queremos que se vean a la derecha, con fondo azul oscuro, texto blanco:
    worksheet.getCell('G1').value = 'Total Cargos:';
    worksheet.getCell('G1').alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.getCell('G1').font = { bold: true };

    // Fusiona la celda H1..I1 para el valor
    worksheet.mergeCells('H1:J1');
    worksheet.getCell('H1').value = {
      formula: `SUM(E6:E${invoiceData.length + 5})`,
    };
    worksheet.getCell('H1').numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';
    worksheet.getCell('H1').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('H1').font = { bold: true };

    // Total Abonos
    worksheet.getCell('G2').value = 'Total Abonos:';
    worksheet.getCell('G2').alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.getCell('G2').font = { bold: true };

    worksheet.mergeCells('H2:J2');
    worksheet.getCell('H2').value = {
      formula: `SUM(F6:F${invoiceData.length + 5})`,
    };
    worksheet.getCell('H2').numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';
    worksheet.getCell('H2').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('H2').font = { bold: true };

    // Saldo
    worksheet.getCell('G3').value = 'Saldo:';
    worksheet.getCell('G3').alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.getCell('G3').font = { bold: true };

    worksheet.mergeCells('H3:J3');
    worksheet.getCell('I3').value = { formula: `H1-H2` };
    worksheet.getCell('I3').numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';
    worksheet.getCell('I3').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('I3').font = { bold: true };

    // Ahora damos fondo/bordes a G1..I3
    ['G1', 'H1', 'G2', 'H2', 'G3', 'H3', 'I3'].forEach((cellAddress) => {
      const cell = worksheet.getCell(cellAddress);
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2A4D69' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Ajustar altura de la fila 3 si gustas
    worksheet.getRow(3).height = 30;

    // === 5) ENCABEZADO DE TABLA (FILA 5) ===
    const headerRowNumber = 5;
    const headerRow = worksheet.getRow(headerRowNumber);
    headerRow.values = [
      'Emisión',
      'Serie',
      'Folio',
      'Concepto',
      'Cargo',
      'Abono',
      'Periodo',
      'Timbrado',
    ];
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2A4D69' },
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.border = thinBorder;
    });

    // === 6) LLENADO DE DATOS DE LA TABLA (DESDE FILA 6) ===
    let currentRow = headerRowNumber + 1;
    for (const item of invoiceData) {
      const row = worksheet.getRow(currentRow);

      let concepto = '';
      if (item.tipo_factura === 'I') concepto = 'Ingreso';
      else if (item.tipo_factura === 'E') concepto = 'Egreso';
      else if (item.tipo_factura === 'P') concepto = 'Pago';

      const estado = item.estado === 'valida' ? '✔' : '✘';
      const cargo = item.tipo_factura === 'I' ? item.total || 0 : 0;

      let abono = 0;
      if (item.tipo_factura === 'E') {
        abono = item.total || 0;
      } else if (item.tipo_factura === 'P') {
        abono = item.total || 0;
      }

      const periodo =
        moment.parseZone(item.fecha_inicio).format('DD/MM/YYYY') +
        ' - ' +
        moment.parseZone(item.fecha_fin).format('DD/MM/YYYY');
      
      row.values = [
        item.fecha_emision
          ? moment.parseZone(item.fecha_emision).format('DD/MM/YYYY')
          : '',
        item.serieSucursal + (item.estadoDePago || ''),
        item.folio || '',
        concepto,
        cargo,
        abono,
        periodo,
        estado,
      ];

      row.eachCell((cell) => {
        cell.border = thinBorder;
        cell.alignment = { horizontal: 'center', wrapText: true };
      });

      currentRow++;
    }

    // Formato monetario para columnas Cargo (col 5) y Abono (col 6)
    worksheet.getColumn(5).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';
    worksheet.getColumn(6).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';

    // === 7) LEYENDA FINAL (PAR DE FILAS ABAJO) ===
    currentRow += 2;
    const leyendaRow = worksheet.getRow(currentRow);
    leyendaRow.getCell(1).value = `Generado en Timbrela® el: ${moment()
      .parseZone()
      .format('DD-MM-YYYY HH:mm')} GMT-6`;
    leyendaRow.getCell(1).font = { italic: true, color: { argb: 'FF666666' } };
    leyendaRow.getCell(1).protection = { locked: true };

    // Finalmente, retornamos el buffer
    return workbook.xlsx.writeBuffer();
  }
}

module.exports = facturacionServicios;
