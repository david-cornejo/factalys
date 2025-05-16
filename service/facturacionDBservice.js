const { models } = require('../libs/sequelize');
const { Op, where } = require('sequelize');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const ExcelJS = require('exceljs');
const JSZip = require('jszip');
class FacturaEstadoServicios {
  async findFacturesByDBFilters(filters = {}) {
    try {
      const {
        fechaInicio,
        customer,
        fechaFin,
        tipos,
        estadosPago,
        serieSucursal,
        rfcCliente,
        idCliente,
      } = filters;
  
      const startDate = fechaInicio
        ? moment.tz(fechaInicio, 'YYYY-MM-DD', 'America/Mexico_City').startOf('day').toDate()
        : null;
  
      const endDate = fechaFin
        ? moment.tz(fechaFin, 'YYYY-MM-DD', 'America/Mexico_City').endOf('day').toDate()
        : null;
  
      const whereConditions = {};
  
      if (idCliente) {
        const cliente = await models.Clientes.findOne({ where: { id_cliente: idCliente } });
        if (!cliente) throw new Error(`No se encontró cliente con el ID: ${idCliente}`);
        whereConditions.id_cliente = cliente.id_cliente;
      }
  
      if (rfcCliente) {
        const cliente = await models.Clientes.findOne({ where: { rfc_cliente: rfcCliente } });
        if (!cliente) throw new Error(`No se encontró cliente con el RFC: ${rfcCliente}`);
        whereConditions.id_cliente = cliente.id_cliente;
      }
  
      if (customer) {
        const cliente = await models.Clientes.findOne({ where: { id_facturapi: customer } });
        if (!cliente) throw new Error(`No se encontró cliente con id_facturapi: ${customer}`);
        whereConditions.id_cliente = cliente.id_cliente;
      }
  
      if (startDate && endDate) {
        whereConditions.fecha_emision = { [Op.between]: [startDate, endDate] };
      } else if (startDate) {
        whereConditions.fecha_emision = { [Op.gte]: startDate };
      } else if (endDate) {
        whereConditions.fecha_emision = { [Op.lte]: endDate };
      }
  
      if (tipos && tipos.length > 0) {
        whereConditions.tipo_factura = { [Op.in]: tipos };
      }
  
      if (estadosPago && estadosPago.length > 0) {
        whereConditions.estadoDePago = { [Op.in]: estadosPago };
      }
  
      // 🔹 Convertir serieSucursal en arreglo si es string separado por comas
      const sucursalesFiltradas = Array.isArray(serieSucursal)
        ? serieSucursal
        : typeof serieSucursal === 'string'
          ? serieSucursal.split(',')
          : [];
  
      if (sucursalesFiltradas.length > 0) {
        if (!sucursalesFiltradas.includes('COR')) {
          whereConditions.serieSucursal = { [Op.in]: sucursalesFiltradas };
          //console.log(`Filtrando por sucursales: ${sucursalesFiltradas.join(', ')}`);
        } else {
          //console.log('Usuario corporativo: sin filtro por sucursal.');
        }
      }
  
      const [facturas, reps, notasCredito, pagos] = await Promise.all([
        models.Facturacion.findAll({
          where: whereConditions,
          attributes: [
            'id_facturacion', 'tipo_factura', 'fecha_emision', 'id_cliente', 'total',
            'estadoDePago', 'serieSucursal', 'folio', 'fecha_inicio', 'fecha_fin',
            'atendida', 'estado',
          ],
          include: [{
            model: models.Clientes,
            as: 'clientes',
            attributes: ['nombre_cliente'],
          }],
        }),
        models.Rep.findAll({
          where: whereConditions,
          attributes: [
            'id_facturacion', 'tipo_factura', 'fecha_emision', 'id_cliente', 'total',
            'estadoDePago', 'serieSucursal', 'folio', 'fecha_inicio', 'fecha_fin',
            'atendida', 'estado',
          ],
          include: [{
            model: models.Clientes,
            as: 'clientes',
            attributes: ['nombre_cliente'],
          }],
        }),
        models.NotaCredito.findAll({
          where: whereConditions,
          attributes: [
            'id_facturacion', 'tipo_factura', 'fecha_emision', 'id_cliente', 'total',
            'estadoDePago', 'serieSucursal', 'folio', 'fecha_inicio', 'fecha_fin',
            'atendida', 'estado',
          ],
          include: [{
            model: models.Clientes,
            as: 'clientes',
            attributes: ['nombre_cliente'],
          }],
        }),
        models.Pago.findAll({
          where: whereConditions,
          attributes: [
            'id_facturacion', 'tipo_factura', 'fecha_emision', 'id_cliente', 'total',
            'estadoDePago', 'serieSucursal', 'folio', 'fecha_inicio', 'fecha_fin',
            'atendida', 'estado',
          ],
          include: [{
            model: models.Clientes,
            as: 'clientes',
            attributes: ['nombre_cliente'],
          }],
        }),
      ]);
  
      const todasFacturas = [...facturas, ...reps, ...notasCredito, ...pagos];
      todasFacturas.sort((a, b) => new Date(a.fecha_emision) - new Date(b.fecha_emision));
  
      return todasFacturas;
    } catch (error) {
      throw new Error(`Error al buscar facturas en la base de datos: ${error.message}`);
    }
  }

  async descargarFacturaXML(id_factura) {
    try {
      const xmlRecord = await models.XML.findOne({
        where: { id_factura: id_factura },
      });

      if (!xmlRecord) {
        throw new Error('No se encontró el PDF para esta factura.');
      }

      const filePath = `./factura_${id_factura}.xml`;
      fs.writeFileSync(filePath, xmlRecord.archivo);

      return filePath;
    } catch (error) {
      throw new Error(`Error al descargar el PDF: ${error.message}`);
    }
  }

  async descargarFacturaPDF(id_factura) {
    try {
      const pdfRecord = await models.PDF.findOne({
        where: { id_factura: id_factura },
      });

      if (!pdfRecord) {
        throw new Error('No se encontró el PDF para esta factura.');
      }

      const filePath = `./factura_${id_factura}.pdf`;
      fs.writeFileSync(filePath, pdfRecord.archivo);

      return filePath;
    } catch (error) {
      throw new Error(`Error al descargar el PDF: ${error.message}`);
    }
  }

  async obtenerArchivosFacturaDB(id_factura) {
    try {
      // 🔹 Buscar el archivo PDF en la base de datos
      const pdf = await models.PDF.findOne({
        where: { id_factura },
      });

      // 🔹 Buscar el archivo XML en la base de datos
      const xml = await models.XML.findOne({
        where: { id_factura },
      });

      if (!pdf && !xml) {
        throw new Error('No se encontraron archivos para esta factura.');
      }

      // 🔹 Crear un archivo ZIP que contenga ambos documentos
      const zip = new JSZip();

      if (pdf) {
        zip.file(`factura_${id_factura}.pdf`, pdf.archivo);
      }

      if (xml) {
        zip.file(`factura_${id_factura}.xml`, xml.archivo);
      }

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      return {
        pdf: pdf ? pdf.archivo : null,
        xml: xml ? xml.archivo : null,
        zip: zipBuffer,
      };
    } catch (error) {
      console.error(
        `Error al obtener archivos de la factura ${id_factura}:`,
        error
      );
      throw new Error(`No se pudieron obtener los archivos: ${error.message}`);
    }
  }

  async generarReporteGlobal(datos, fechaInicio, fechaFin) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const logoPathLeft = path.resolve(__dirname, '../assets/logoSM8.png');
      const headerHeight = 90;

      if (fs.existsSync(logoPathLeft)) {
        doc.image(
          logoPathLeft,
          doc.page.margins.left + 5,
          doc.page.margins.top + 10,
          { width: 80 }
        );
      } else {
        console.warn(`No se encontró el logo izquierdo en: ${logoPathLeft}`);
      }

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text(
          'Reporte Global de Facturación',
          doc.page.margins.left + 10,
          doc.page.margins.top + 20,
          {
            align: 'center',
          }
        );

      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#555555')
        .text(
          `Rango de Fechas: ${fechaInicio} a ${fechaFin}`,
          doc.page.margins.left + 14,
          doc.y + 5,
          {
            align: 'center',
          }
        );

      doc
        .moveTo(doc.page.margins.left, doc.page.margins.top + headerHeight)
        .lineTo(
          doc.page.width - doc.page.margins.right,
          doc.page.margins.top + headerHeight
        )
        .strokeColor('#CCCCCC')
        .lineWidth(1)
        .stroke();

      doc.y = doc.page.margins.top + headerHeight + 20;

      const estados = {
        VP: 'Venta Pagada',
        VN: 'Venta No Pagada',
        SP: 'Servicio Pagado',
        SN: 'Servicio No Pagado',
        NC: 'Nota de Crédito',
        REP: 'Reporte Electrónico de Pago',
        PDC: 'Pago del Cliente',
      };

      const columns = [
        { header: 'Emisión', width: 80, align: 'center' },
        { header: 'Serie', width: 90, align: 'center' },
        { header: 'Folio', width: 40, align: 'center' },
        { header: 'Cliente', width: 200, align: 'center' },
        { header: 'Cargos', width: 70, align: 'center' },
        { header: 'Abonos', width: 70, align: 'center' },
      ];

      const tableX = 40;
      const rowHeight = 20;
      const headerRowHeight = 20;
      const spacingAfterTable = 30;
      const totalTableWidth = columns.reduce((sum, col) => sum + col.width, 0);

      // Función para formatear montos de dinero con separadores de miles y dos decimales.
      const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      };

      const drawTableHeader = (startY) => {
        doc
          .save()
          .rect(tableX, startY, totalTableWidth, headerRowHeight)
          .fill('#2A4D69')
          .restore();

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
        let x = tableX;
        columns.forEach((col) => {
          doc.text(col.header, x + 5, startY + 5, {
            width: col.width - 10,
            align: col.align,
          });
          x += col.width;
        });

        doc
          .moveTo(tableX, startY + headerRowHeight)
          .lineTo(tableX + totalTableWidth, startY + headerRowHeight)
          .strokeColor('#2A4D69')
          .stroke();

        return startY + headerRowHeight;
      };

      const drawTableRow = (y, rowData) => {
        doc.font('Helvetica').fontSize(9).fillColor('#000000');
        let x = tableX;
        columns.forEach((col, index) => {
          doc.text(rowData[index], x + 5, y + 5, {
            width: col.width - 10,
            align: col.align,
          });
          x += col.width;
        });

        doc
          .moveTo(tableX, y + rowHeight)
          .lineTo(tableX + totalTableWidth, y + rowHeight)
          .strokeColor('#AAAAAA')
          .stroke();

        return y + rowHeight;
      };

      const startEstadoSection = (estado) => {
        doc.x = doc.page.margins.left;
        doc.moveDown(1);

        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#000000')
          .text(`Concepto: ${estado}`, {
            underline: true,
            width:
              doc.page.width - doc.page.margins.left - doc.page.margins.right,
            align: 'left',
          });

        doc.moveDown(0.5);
      };

      // Variables para los totales generales
      let totalGeneralCargos = 0;
      let totalGeneralAbonos = 0;

      Object.keys(estados).forEach((estado) => {
        const facturas = datos
          .filter((f) => f.estadoDePago === estado)
          .sort((a, b) => new Date(a.fecha_emision) - new Date(b.fecha_emision));

        if (facturas.length > 0) {
          startEstadoSection(estados[estado]);
          let sumCargos = 0;
          let sumAbonos = 0;
          let tableY = doc.y;
          tableY = drawTableHeader(tableY);

          facturas.forEach((factura) => {
            // Se formatea la fecha
            const fecha = moment(factura.fecha_emision).isValid()
            ? moment.parseZone(factura.fecha_emision).format('DD/MM/YYYY')
            : 'Fecha Inválida';
            // Se asegura que el total sea un número
            const total =
              factura.total && !isNaN(Number(factura.total))
                ? Number(factura.total)
                : 0;

            let cargos = '$0.00';
            let abonos = '$0.00';

            // Se determina si se asigna a cargos o abonos y se formatea el monto
            if (['NC', 'REP', 'PDC'].includes(factura.estadoDePago)) {
              abonos = '$' + formatMoney(total);
              sumAbonos += total;
            } else {
              cargos = '$' + formatMoney(total);
              sumCargos += total;
            }

            const rowData = [
              fecha,
              `${factura.serieSucursal || 'N/A'}${factura.estadoDePago || ''}`,
              factura.folio || 'N/A',
              factura.clientes?.nombre_cliente || 'N/A',
              cargos,
              abonos,
            ];

            if (
              tableY + rowHeight >
              doc.page.height - doc.page.margins.bottom
            ) {
              doc.addPage();
              tableY = drawTableHeader(doc.y);
            }

            tableY = drawTableRow(tableY, rowData);
          });

          // Imprime los totales por concepto y acumula a los totales generales
          doc.moveDown(0.5);
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#000000')
            .text(
              `Total Cargos: $${formatMoney(
                sumCargos
              )}  |  Total Abonos: $${formatMoney(sumAbonos)}`,
              tableX,
              tableY + 5
            );
          doc.y = tableY + spacingAfterTable;

          totalGeneralCargos += sumCargos;
          totalGeneralAbonos += sumAbonos;
        }
      });

      // Agregar Total General del Reporte con formato correcto
      doc.moveDown(1);
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(
          `Total General del Reporte:  Total Cargos: $${formatMoney(
            totalGeneralCargos
          )}  |  Total Abonos: $${formatMoney(totalGeneralAbonos)}`,
          tableX,
          doc.y,
          { align: 'center' }
        );

      // Pie de página
      doc
        .moveTo(
          doc.page.margins.left,
          doc.page.height - doc.page.margins.bottom - 30
        )
        .lineTo(
          doc.page.width - doc.page.margins.right,
          doc.page.height - doc.page.margins.bottom - 30
        )
        .strokeColor('#CCCCCC')
        .lineWidth(1)
        .stroke();

      const footerTextY = doc.page.height - doc.page.margins.bottom - 20;
      const footerWidth =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;

      doc.fontSize(10).font('Helvetica').fillColor('#000000');
      doc.text(
        `Generado en Timbrela ® el: ${moment().utcOffset('-06:00').format('DD/MM/YYYY HH:mm:ss')}`,
        doc.page.margins.left,
        footerTextY,
        { width: footerWidth, align: 'right' }
      );

      doc.end();
    });
  }

  async generarReporteGlobalExcel({
    fechaInicio,
    fechaFin,
    estadosPago,
    rfcCliente,
    serieSucursal,
  }) {
    const filters = {
      fechaInicio,
      fechaFin,
      estadosPago: estadosPago ? estadosPago.split(',') : [],
      rfcCliente,
      serieSucursal, // Usar el valor del token
    };
  
    let facturas = await this.findFacturesByDBFilters(filters);
  
    facturas = facturas
      .filter((factura) => factura.estado !== 'cancelada')
      .sort((a, b) => {
        // Primero por estadoDePago
        if (a.estadoDePago > b.estadoDePago) return 1;
        if (a.estadoDePago < b.estadoDePago) return -1;
  
        // Luego por fecha_emision (ascendente)
        const fechaA = new Date(a.fecha_emision);
        const fechaB = new Date(b.fecha_emision);
        return fechaA - fechaB;
      });
  
    return this.crearExcel(facturas, fechaInicio, fechaFin);
  }

  async crearExcel(facturas, fechaInicio, fechaFin) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Global');

    // Ajusta anchos a tu preferencia
    worksheet.getColumn(1).width = 17; // A
    worksheet.getColumn(2).width = 13; // B
    worksheet.getColumn(3).width = 15; // C
    worksheet.getColumn(4).width = 15; // D
    worksheet.getColumn(5).width = 30; // E
    worksheet.getColumn(6).width = 20; // F
    worksheet.getColumn(7).width = 20; // G

    // Borde delgado para reutilizar
    const thinBorder = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // 1) Logo grande en A1:A3, tal como en tu primer ejemplo
    const logoPath = path.resolve(
      __dirname,
      '../assets/Logo Horizonta con fondo.png'
    );
    const logoId = workbook.addImage({ filename: logoPath, extension: 'png' });
    // Fusionamos solo A1:A3 (una sola celda)
    worksheet.mergeCells('A1:A3');
    // Ubicamos la imagen de col=0 a col=1 => ocupa solamente la columna A “completa”
    worksheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      br: { col: 1, row: 3 },
    });

    const row1 = worksheet.getRow(1);
    row1.values = ['', 'REPORTE GLOBAL DE FACTURACIÓN'];
    worksheet.mergeCells('B1:E1');
    row1.height = 25;
    row1.font = { name: 'Helvetica', size: 16, bold: true };
    row1.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    // Si deseas bordes o un color de fondo, aplícalos únicamente a las columnas B..E:
    row1.eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 5) {
        cell.border = thinBorder;
      }
    });

    // 3) Rango de fechas en B2:E2 (justo debajo del título)
    const dateRangeRow = worksheet.getRow(2);
    // De nuevo, primer elemento vacío (A), segundo con tu texto (B)
    dateRangeRow.values = [
      '',
      fechaInicio && fechaFin
        ? `Rango de Fechas: ${fechaInicio} - ${fechaFin}`
        : '',
    ];
    worksheet.mergeCells('B2:E2');
    dateRangeRow.height = 20;
    dateRangeRow.font = { italic: true, size: 12 };
    dateRangeRow.alignment = { horizontal: 'center', vertical: 'middle' };
    dateRangeRow.eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 5) {
        cell.border = thinBorder;
      }
    });

    // Totales en F1:G3 (igual que siempre)
    worksheet.getCell('F1').value = 'Total Cargos:';
    worksheet.getCell('F1').alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.getCell('F1').font = { bold: true };
    worksheet.getCell('G1').value = {
      formula: `SUM(F6:F${facturas.length + 5})`,
    };
    worksheet.getCell('G1').numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';

    worksheet.getCell('F2').value = 'Total Abonos:';
    worksheet.getCell('F2').alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.getCell('F2').font = { bold: true };
    worksheet.getCell('G2').value = {
      formula: `SUM(G6:G${facturas.length + 5})`,
    };
    worksheet.getCell('G2').numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';

    worksheet.getCell('F3').value = 'Saldo:';
    worksheet.getCell('F3').alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    worksheet.getCell('F3').font = { bold: true };
    worksheet.getCell('G3').value = { formula: `G1-G2` };
    worksheet.getCell('G3').numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';

    // Dales color de fondo a F1..G3 si quieres (como en tu ejemplo)
    ['F1', 'G1', 'F2', 'G2', 'F3', 'G3'].forEach((cellAddr) => {
      const cell = worksheet.getCell(cellAddr);
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2A4D69' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Cabecera de columnas (fila 5)
    const headerRow = worksheet.getRow(5);
    headerRow.values = [
      'Emisión',
      'Serie',
      'Concepto',
      'Folio',
      'Cliente',
      'Cargos',
      'Abonos',
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

    // Filas de datos (desde la fila 6)
    let currentRow = 6;
    facturas.forEach((factura) => {
      const total = factura.total || 0;
      const abonos = ['NC', 'REP', 'PDC'].includes(factura.estadoDePago) ? total : 0;
      const cargos = !['NC', 'REP', 'PDC'].includes(factura.estadoDePago) ? total : 0;

      const row = worksheet.getRow(currentRow);
      row.values = [
        moment.parseZone(factura.fecha_emision).format('DD/MM/YYYY'),
        factura.serieSucursal || 'N/A',
        factura.estadoDePago || 'N/A',
        factura.folio || 'N/A',
        factura.clientes?.nombre_cliente || 'N/A',
        cargos,
        abonos,
      ];

      row.getCell(6).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';
      row.getCell(7).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';

      // Borde y alineación
      row.eachCell((cell) => {
        cell.border = thinBorder;
        cell.alignment = { horizontal: 'center', wrapText: true };
      });
      currentRow++;
    });
    currentRow += 2;
    const leyendaRow = worksheet.getRow(currentRow);
    leyendaRow.getCell(1).value = `Generado en Timbrela® el: ${moment().utcOffset('-06:00').format('DD-MM-YYYY HH:mm')} GMT-6`
    leyendaRow.getCell(1).font = { italic: true, color: { argb: 'FF666666' } };
    leyendaRow.getCell(1).protection = { locked: true };

    return workbook.xlsx.writeBuffer();
  }

  async marcarFacturaAtendida(id) {
    try {
      const factura = await models.Facturacion.findByPk(id);

      if (!factura) {
        throw new Error('Factura no encontrada');
      }

      factura.atendida = true; // 🔹 Cambiamos el estado a `true`
      await factura.save();

      return { message: 'Factura marcada como atendida', factura };
    } catch (error) {
      console.error(`Error al marcar la factura ${id} como atendida:`, error);
      throw new Error('No se pudo actualizar el estado de la factura.');
    }
  }

  async crearPDFPagoCliente(data) {
    const {
      id_factura,
      cliente,
      fecha_pago,
      monto,
      serieSucursal,
      folio,
      documentos = [],
    } = data;

    const buffers = [];
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', async () => {
      const buffer = Buffer.concat(buffers);
      // Guardar en DB
      await models.PDF.create({
        id_factura,
        archivo: buffer,
      });
    });

    // ---- Logo SM8 en la esquina superior izquierda ----
    const logoPath = path.resolve(__dirname, '../assets/logoSM8.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 20, { width: 100 });
    }

    // ---- Datos de la empresa a la derecha ----
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#e60000')
      .text('Sistemas Multidireccionales', 160, 20)
      .text('SM8 de Mexico SA de CV', 160)
      .fillColor('#000000')
      .font('Helvetica')
      .text('SMS1505137Y3', 160)
      .text('601 - General de Ley Personas Morales', 160)
      .text('Expedición: 06600', 160);

    // ---- Encabezado: Tipo CFDI y Folio ----
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#000000')
      .text('Tipo CFDI: P - Pagos', 380, 30, { align: 'right' })
      .fillColor('#2A4D69')
      .text('PAGO DEL CLIENTE', { align: 'right' })
      .fillColor('red')
      .fontSize(14)
      .text(`${serieSucursal || ''}PDC${folio}`, { align: 'right' })
      .fillColor('black')
      .fontSize(10)
      .text(`Fecha emisión: ${moment(fecha_pago).format('DD/MM/YYYY')}`, {
        align: 'right',
      });

    // ---- Receptor (Ordenante del Pago) ----
    doc
      .fillColor('white')
      .rect(40, 100, 520, 20)
      .fill('#2A4D69')
      .fillColor('white')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Receptor (Ordenante del Pago)', 45, 105);

    doc
      .fillColor('black')
      .font('Helvetica')
      .fontSize(10)
      .text(cliente?.nombre || 'Nombre no definido', 45, 125)
      .text(`RFC: ${cliente?.rfc || 'RFC no definido'}`, 45, 140);

    // ---- Información del pago (barra azul) ----
    doc
      .fillColor('white')
      .rect(40, 170, 520, 20)
      .fill('#2A4D69')
      .fillColor('white')
      .font('Helvetica-Bold')
      .text('INFORMACIÓN DEL PAGO', 45, 175);

    doc.font('Helvetica').fontSize(9).fillColor('black');

    doc.text(
      `Fecha de Pago: ${moment(fecha_pago).format('DD/MM/YYYY')}`,
      45,
      195
    );
    doc.text(
      `Forma de Pago: ${documentos[0]?.forma_pago || 'No definido'}`,
      45,
      210
    );
    doc.text(`Moneda: Peso Mexicano`, 45, 225);

    doc.text(`Tipo de Cambio: 0.000000`, 300, 195);
    doc.text(`Monto: ${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(monto)}`, 300, 210);
    doc.text(`Número de Operación:`, 300, 225);

    // ---------------------------------------
    // DOCUMENTOS PAGADOS (barra azul)
    // ---------------------------------------
    doc
      .fillColor('white')
      .rect(40, 255, 520, 20)
      .fill('#2A4D69')
      .fillColor('white')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('DOCUMENTOS PAGADOS', 45, 260);

    // Ajuste vertical para el contenido
    let docsStartY = 280;
    documentos.forEach((docPago) => {
      const leftX = 45;
      const rightX = 320; // Ajusta si quieres más o menos espacio
      const lineHeight = 15;

      // Primera columna
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('black')
        .text(`UUID: ${docPago.uuid || 'N/A'}`, leftX, docsStartY)
        .text(
          `Serie: ${docPago.serie || 'N/A'}`,
          leftX,
          docsStartY + lineHeight
        )
        .text(`Moneda: MXN`, leftX, docsStartY + lineHeight * 2)
        .text(`Tipo de Cambio: 0.0000`, leftX, docsStartY + lineHeight * 3);

      // Segunda columna
      doc
        .text(`Folio: ${docPago.folio || 'N/A'}`, rightX, docsStartY)
        .text(
          `Método de Pago: ${docPago.metodo_pago || 'N/A'}`,
          rightX,
          docsStartY + lineHeight
        )
        .text(
          `Pagado: ${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(docPago.pagado || 0)}`,
          rightX,
          docsStartY + lineHeight * 2
        );

      docsStartY += lineHeight * 4 + 10; // Espacio tras cada bloque
    });

    // Tipo de relación / CFDI Relacionado
    doc
      .fontSize(9)
      .fillColor('black')
      .text('Tipo de relación: -', 45, docsStartY)
      .text('CFDI Relacionado:', 45, docsStartY + 15);

    // ---- Mensaje final en color rojo ----
    doc
      .moveDown(1)
      .fillColor('red')
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Este documento no es un CFDI', 200, docsStartY + 60);

    // ---- Pie de página ----
    doc
      .moveTo(40, doc.page.height - 60)
      .lineTo(doc.page.width - 40, doc.page.height - 60)
      .strokeColor('#000000')
      .stroke();

    doc
      .fontSize(8)
      .fillColor('black')
      .text('Hoja 1', 500, doc.page.height - 50);

    doc.end();
  }
  
  async generarReporteSaldosClientesExcel({ fechaInicio, fechaFin, serieSucursal }) {
    const filters = { fechaInicio, fechaFin, serieSucursal };
    const facturas = await this.findFacturesByDBFilters(filters);
    const vigentes = facturas.filter((f) => f.estado !== 'cancelada');
  
    const sucursales = Array.isArray(serieSucursal)
      ? serieSucursal.join(', ')
      : serieSucursal || 'Todas';

    // Generamos el resumen de cargos y abonos
    const resumen = {};
    for (const f of vigentes) {
      const id = f.id_cliente;
      const nombre = f.clientes?.nombre_cliente || 'Sin nombre';
      const total = f.total || 0;

      if (!resumen[id]) {
        resumen[id] = { nombre, cargos: 0, abonos: 0 };
      }

      // Cargos
      if (['SP', 'SN', 'VP', 'VN'].includes(f.estadoDePago)) {
        resumen[id].cargos += total;
      }
      // Abonos
      if (['NC', 'REP', 'PDC'].includes(f.estadoDePago)) {
        resumen[id].abonos += total;
      }
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Saldos Clientes');

    // 1) Ajuste de columnas para un estilo similar al "Reporte Global":
    //    A-B para la imagen (fusionadas), C-E para título, F-G para totales,
    //    y luego la tabla comienza en la fila 5 o 6.
    sheet.getColumn(1).width = 10;  // Logo (col. A)
    sheet.getColumn(2).width = 10;  // Logo (col. B)
    sheet.getColumn(3).width = 25;  // Título/Subtítulo (col. C)
    sheet.getColumn(4).width = 25;  // Título/Subtítulo (col. D)
    sheet.getColumn(5).width = 25;  // Título/Subtítulo (col. E)
    sheet.getColumn(6).width = 15;  // Totales (col. F)
    sheet.getColumn(7).width = 18;  // Totales (col. G)

    // 2) Ajuste de alturas para las primeras filas
    sheet.getRow(1).height = 35;
    sheet.getRow(2).height = 20;
    sheet.getRow(3).height = 20;
    // Dejamos la fila 4 como separador o para uso futuro

    // Borde fino para reutilizar en celdas
    const thinBorder = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // 3) LOGO (A1:B4)
    const logoPath = path.resolve(__dirname, '../assets/Logo Horizonta con fondo.png');
    const logoId = workbook.addImage({ filename: logoPath, extension: 'png' });
    sheet.mergeCells('A1:B2'); // Un bloque alto/rectangular para el logo
    sheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      // Ajusta según el tamaño real de tu logo
      ext: { width: 156, height: 100 },
    });

    // 4) TÍTULO PRINCIPAL (C1:E1)  
    const row1 = sheet.getRow(1);
    row1.values = ['', '', 'REPORTE DE SALDOS DE CLIENTES', '', ''];
    sheet.mergeCells('C1:E1');
    row1.font = { size: 16, bold: true };
    row1.alignment = { horizontal: 'center', vertical: 'middle' };

    // 5) SUBTÍTULO O RANGO DE FECHAS (C2:E2)
    const row2 = sheet.getRow(2);
    row2.values = [
      '',
      '',
      fechaInicio && fechaFin
        ? `Rango de Fechas: ${fechaInicio} - ${fechaFin}`
        : '',
      '',
      '',
    ];
    row2.font = { italic: true, size: 12 };
    row2.alignment = { horizontal: 'center' };
    sheet.mergeCells('C2:E2');

        // 5.1) Mostrar las sucursales en C3:E3
    const row3 = sheet.getRow(3);
    row3.values = ['', '', `Sucursal: ${sucursales}`, '', '', ''];
    sheet.mergeCells('C3:E3');
    row3.font = { italic: true, size: 12 };
    row3.alignment = { horizontal: 'center' };

    // 6) Totales (F1:G3). Se aprovechan filas 1,2,3 (mismo alto).
    //    Cada fila tendrá su etiqueta en la col. F y el valor en la col. G
    sheet.getCell('F1').value = 'Total Cargos:';
    sheet.getCell('G1').value = Object.values(resumen).reduce(
      (sum, c) => sum + c.cargos,
      0
    );
    sheet.getCell('G1').numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';

    sheet.getCell('F2').value = 'Total Abonos:';
    sheet.getCell('G2').value = Object.values(resumen).reduce(
      (sum, c) => sum + c.abonos,
      0
    );
    sheet.getCell('G2').numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';

    sheet.getCell('F3').value = 'Saldo:';
    sheet.getCell('G3').value = { formula: 'G1-G2' };
    sheet.getCell('G3').numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';

    // Estilizamos estas celdas de totales para que luzcan como un bloque
    ['F1', 'G1', 'F2', 'G2', 'F3', 'G3'].forEach((c) => {
      const cell = sheet.getCell(c);
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2A4D69' }, // Color de fondo
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
    });

    // 7) Encabezado de la tabla en fila 5 (p.ej. "Cliente", "Cargos", "Abonos", "Saldo")
    //    Puedes expandirlo si deseas más columnas.
    const headerRow = sheet.getRow(5);
    headerRow.values = ['Cliente', '', '', '', 'Cargos', 'Abonos', 'Saldo'];
    sheet.mergeCells('A5:D5');

    // Damos estilo al header
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2A4D69' },
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.border = thinBorder;
    });

    // 8) Llenamos las filas de datos a partir de la fila 6
    let rowIndex = 6;
    Object.values(resumen).forEach((c) => {
      const row = sheet.getRow(rowIndex);

      // Fusionamos A..D para el nombre del cliente:
      sheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
      row.getCell(1).value = c.nombre;

      // E -> Cargos, F -> Abonos, G -> Saldo (ajustado a la cabecera de ejemplo)
      row.getCell(5).value = c.cargos;
      row.getCell(6).value = c.abonos;
      row.getCell(7).value = {
        formula: `E${rowIndex}-F${rowIndex}`,
        result: c.cargos - c.abonos,
      };

      // Formatos numéricos
      row.getCell(5).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';
      row.getCell(6).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';
      row.getCell(7).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';

      // Bordes y alineación
      [1, 2, 3, 4, 5, 6, 7].forEach((col) => {
        const cell = row.getCell(col);
        cell.border = thinBorder;
        cell.alignment = { horizontal: 'center' };
      });

      rowIndex++;
    });

    // 9) Leyenda final (en fila rowIndex+2, por ejemplo)
    const leyendaRow = sheet.getRow(rowIndex + 2);
    leyendaRow.getCell(1).value = `Generado en Timbrela® el: ${moment()
      .local()
      .format('DD-MM-YYYY HH:mm')} GMT-6`;
    leyendaRow.getCell(1).font = { italic: true, color: { argb: 'FF666666' } };

    // Finalmente, retornamos el buffer
    return workbook.xlsx.writeBuffer();
  }

  async generarReporteAntiguedadSaldosExcel({ fechaCorte, serieSucursal }) {
    const { models } = require('../libs/sequelize');
    const ExcelJS = require('exceljs');
    const moment = require('moment-timezone');
    const { Op } = require('sequelize');
    const fs = require('fs');
    const path = require('path');
  
    const corte = moment.tz(fechaCorte, 'YYYY-MM-DD', 'America/Mexico_City').endOf('day').toDate();
  
    const whereFact = {
      estado: { [Op.ne]: 'cancelada' },
      fecha_emision: { [Op.lte]: corte },
      estadoDePago: { [Op.in]: ['VN', 'SN'] },
    };
  
    const sucursales = Array.isArray(serieSucursal)
      ? serieSucursal.join(', ')
      : serieSucursal || 'Todas';
  
    if (serieSucursal && Array.isArray(serieSucursal) && !serieSucursal.includes('COR')) {
      whereFact.serieSucursal = { [Op.in]: serieSucursal };
    }
  
    const facturas = await models.Facturacion.findAll({
      where: whereFact,
      attributes: ['id_facturacion', 'fecha_emision', 'id_cliente', 'total', 'estadoDePago'],
      include: [
        { model: models.Clientes, as: 'clientes', attributes: ['nombre_cliente'] },
        { model: models.Rep, as: 'reps', through: { attributes: [] }, attributes: ['total', 'fecha_emision'], where: { fecha_emision: { [Op.lte]: corte } }, required: false },
        { model: models.NotaCredito, as: 'notasCredito', through: { attributes: [] }, attributes: ['total', 'fecha_emision'], where: { fecha_emision: { [Op.lte]: corte } }, required: false }
      ]
    });
  
    const resumen = {};
    facturas.forEach(f => {
      const totalFac = Number(f.total) || 0;
      const sumaREPs = (f.reps || []).reduce((s, r) => s + (Number(r.total) || 0), 0);
      const sumaNCs = (f.notasCredito || []).reduce((s, n) => s + (Number(n.total) || 0), 0);
      const saldo = totalFac - sumaREPs - sumaNCs;
      if (saldo <= 0) return;
  
      const diffDias = moment(corte).diff(moment.parseZone(f.fecha_emision), 'days');
      const idCli = f.id_cliente;
      const nombre = f.clientes.nombre_cliente;
      if (!resumen[idCli]) resumen[idCli] = { nombre, totalVencido: 0, bucket30: 0, bucket60: 0, bucket90: 0, bucket91: 0 };
  
      resumen[idCli].totalVencido += saldo;
      if (diffDias <= 30) resumen[idCli].bucket30 += saldo;
      else if (diffDias <= 60) resumen[idCli].bucket60 += saldo;
      else if (diffDias <= 90) resumen[idCli].bucket90 += saldo;
      else resumen[idCli].bucket91 += saldo;
    });
  
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Antigüedad Saldo');
    const thinBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    [40, 18, 15, 15, 15, 18].forEach((w, i) => sheet.getColumn(i + 1).width = w);
  
    const logoPath = path.resolve(__dirname, '../assets/Logo Horizonta con fondo.png');
    if (fs.existsSync(logoPath)) {
      const imgId = workbook.addImage({ filename: logoPath, extension: 'png' });
      sheet.mergeCells('A1:A3');
      sheet.addImage(imgId, { tl: { col: 0, row: 0 }, ext: { width: 156, height: 80 } });
    }
  
    // Título
    sheet.mergeCells('B1:F1');
    sheet.getRow(1).getCell(2).value = 'ANTIGÜEDAD DE SALDOS Y PRONÓSTICO DE COBRANZA DE CLIENTES';
    sheet.getRow(1).getCell(2).font = { size: 14, bold: true };
    sheet.getRow(1).getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  
    // Fecha de corte
    sheet.mergeCells('B2:F2');
    sheet.getRow(2).getCell(2).value = `Fecha de Corte: ${moment(corte).format('DD/MMM/YYYY').toUpperCase()}`;
    sheet.getRow(2).getCell(2).font = { italic: true };
    sheet.getRow(2).getCell(2).alignment = { horizontal: 'center' };
  
    // Sucursales
    sheet.mergeCells('B3:F3');
    const sucursalCell = sheet.getCell('B3');
    sucursalCell.value = `Sucursal(es): ${sucursales}`;
    sucursalCell.font = { italic: true };
    sucursalCell.alignment = { horizontal: 'center' };
  
    // Título rojo
    sheet.mergeCells('B4:F4');
    const celdaTitulo = sheet.getCell('B4');
    celdaTitulo.value = 'SALDOS VENCIDOS';
    celdaTitulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
    celdaTitulo.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    celdaTitulo.alignment = { horizontal: 'center', vertical: 'middle' };
  
    const headerRow = sheet.getRow(6);
    headerRow.values = ['Nombre (Cliente)', 'Total Vencido', '0-30 Días', '31-60 Días', '61-90 Días', '91 Días o más'];
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A4D69' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
    });
  
    let rowIndex = 7;
    let totalV = 0, t30 = 0, t60 = 0, t90 = 0, t91 = 0;
  
    Object.values(resumen).forEach(cliente => {
      const row = sheet.getRow(rowIndex++);
      row.values = [cliente.nombre, cliente.totalVencido, cliente.bucket30, cliente.bucket60, cliente.bucket90, cliente.bucket91];
      [2, 3, 4, 5, 6].forEach(col => row.getCell(col).numFmt = '"$"#,##0.00');
      row.eachCell(cell => {
        cell.border = thinBorder;
        cell.alignment = { horizontal: 'center', wrapText: true };
      });
  
      totalV += cliente.totalVencido;
      t30 += cliente.bucket30;
      t60 += cliente.bucket60;
      t90 += cliente.bucket90;
      t91 += cliente.bucket91;
    });
  
    // Totales al final
    const totalRow = sheet.getRow(rowIndex++);
    totalRow.values = ['Total General', totalV, t30, t60, t90, t91];
    totalRow.font = { bold: true };
    [2, 3, 4, 5, 6].forEach(col => {
      const cell = totalRow.getCell(col);
      cell.numFmt = '"$"#,##0.00';
      cell.border = thinBorder;
      cell.alignment = { horizontal: 'center' };
    });
  
    // Leyenda final
    const leyenda = sheet.getRow(rowIndex + 1);
    sheet.mergeCells(`A${rowIndex + 1}:F${rowIndex + 1}`);
    leyenda.getCell(1).value = `Generado en Timbrela® el: ${moment().utcOffset('-06:00').format('DD-MM-YYYY HH:mm')} GMT-6`;
    leyenda.getCell(1).font = { italic: true, color: { argb: 'FF666666' } };
  
    return workbook.xlsx.writeBuffer();
  }

  async obtenerResumenSaldosClientes({ fechaInicio, fechaFin }) {
    const filters = { fechaInicio, fechaFin };
    const facturas = await this.findFacturesByDBFilters(filters);
    const vigentes = facturas.filter((f) => f.estado !== 'cancelada');
  
    const resumen = {};
    for (const f of vigentes) {
      const id = f.id_cliente;
      const nombre = f.clientes?.nombre_cliente || 'Sin nombre';
      const total = f.total || 0;
  
      if (!resumen[id]) {
        resumen[id] = { nombre, cargos: 0, abonos: 0 };
      }
  
      if (['SP', 'SN', 'VP', 'VN'].includes(f.estadoDePago)) {
        resumen[id].cargos += total;
      }
      if (['NC', 'REP', 'PDC'].includes(f.estadoDePago)) {
        resumen[id].abonos += total;
      }
    }
  
    return Object.entries(resumen).map(([id_cliente, data]) => ({
      id_cliente,
      nombre: data.nombre,
      cargos: data.cargos,
      abonos: data.abonos,
      saldo: data.cargos - data.abonos,
    }));
  }
}

module.exports = FacturaEstadoServicios;
