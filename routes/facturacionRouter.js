const express = require('express');
const facturacionServicios = require('../service/facturacionService');
const facturacionDBServicios = require('../service/facturacionDBservice');
const clientesServicios = require('../service/clienteService');
const { models } = require('../libs/sequelize');
const fs = require('fs');
const { type } = require('os');
const facturapi = require('facturapi');
const passport = require('passport');
const { checkSchema } = require('express-validator');
const { validateRequest } = require('../middlewares/validarHandler');
const {
  createFacturacionSchema,
  filterFacturacionSchema,
  updateStatusFacturacionSchema,
  cancelFacturacionSchema,
} = require('../middlewares/validations/facturacionValidation');
const { checkRoles } = require('./../middlewares/authHandler');
const setupModels = require('../db/models');
const router = express.Router();
const servicios = new facturacionServicios();
const serviciosDB = new facturacionDBServicios();
const serviciosClientes = new clientesServicios();

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  checkSchema(createFacturacionSchema),
  validateRequest,
  async (req, res) => {
    const body = req.body;
    let asignarFactura;
    try {
      const nuevaFactura = await servicios.newFacture(body.facturapi);
      const factureData = await serviciosClientes.buscarFacturas(
        nuevaFactura.customer.id
      );

      const totalFactura =
        nuevaFactura.complements?.reduce((total, complement) => {
          return (
            total +
            (complement.data?.reduce((sum, data) => {
              return (
                sum +
                (data.related_documents?.reduce(
                  (docSum, doc) => docSum + (doc.amount || 0),
                  0
                ) || 0)
              );
            }, 0) || 0)
          );
        }, 0) || nuevaFactura.total;

      const DateLocal = new Date(nuevaFactura.date);
      DateLocal.setHours(DateLocal.getHours() - 6);
      const adjustedDate = DateLocal.toISOString();

      const complementoDate = body.facturapi.complements?.find(
        (complement) => Array.isArray(complement.data) && complement.data[0]?.date
      )?.data[0]?.date || null;

      asignarFactura = await servicios.newDocumentoDB(
        {
          fecha_emision: adjustedDate,
          total: totalFactura,
          tipo_factura: nuevaFactura.type,
          id_facturacion: nuevaFactura.id,
          folio: nuevaFactura.folio_number,
          id_cliente: factureData.id_cliente,
          estadoDePago: body.otros.estado,
          serieSucursal: body.otros.serieSucursal,
          id_sucursal: body.otros.id_sucursal,
          contrato: body.otros.contrato || null,
          fecha_inicio: body.otros.startDate || null,
          fecha_fin: body.otros.endDate || null,
          id_usuario_creador: body.otros.id_usuario_creador,
        },
        body.otros.asesores || [],
        body.otros.id_factura_origen || null,
        complementoDate
      );
      
      await servicios.crearPDF(nuevaFactura.id);
      await servicios.crearXML(nuevaFactura.id);

      // Si es SP o VP, crear automáticamente su documento de pago (PDC)
      if (body.otros.estado === 'SP' || body.otros.estado === 'VP') {
        const pagoPDC = await servicios.newDocumentoDB(
          {
            fecha_emision: adjustedDate,
            total: totalFactura,
            tipo_factura: 'P',
            id_facturacion: `PDC${nuevaFactura.id}`,
            folio: nuevaFactura.folio_number,
            id_cliente: factureData.id_cliente,
            estadoDePago: 'PDC',
            serieSucursal: body.otros.serieSucursal,
            id_sucursal: body.otros.id_sucursal,
            contrato: body.otros.contrato || null,
            fecha_inicio: body.otros.startDate || null,
            fecha_fin: body.otros.endDate || null,
            id_usuario_creador: body.otros.id_usuario_creador,
          },
          [],
          nuevaFactura.id // relación con la factura principal
        );

        await serviciosDB.crearPDFPagoCliente({
          id_factura: pagoPDC.id_facturacion,
          cliente: {
            nombre: nuevaFactura.customer.legal_name,
            rfc: nuevaFactura.customer.tax_id,
          },
          fecha_pago: adjustedDate,
          monto: totalFactura,
          folio: nuevaFactura.folio_number,
          serieSucursal: body.otros.serieSucursal,
          documentos: [
            {
              uuid: nuevaFactura.uuid,
              serie: nuevaFactura.series,
              folio: nuevaFactura.folio_number, 
              metodo_pago: nuevaFactura.payment_method,
              forma_pago: nuevaFactura.payment_form,
              pagado: nuevaFactura.total,
            },
          ],
        });
      }

      res.status(200).json(asignarFactura);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  '/download',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id, type } = req.query;

    if (!id || !type) {
      return res
        .status(400)
        .json({ error: 'Faltan parámetros: id y type son requeridos.' });
    }

    try {
      let fileBuffer;
      let fileType;
      let fileName = `factura_${id}.${type}`;

      switch (type) {
        case 'pdf':
          fileBuffer = await servicios.downloadFacturePdf(id);
          fileType = 'application/pdf';
          break;
        case 'xml':
          fileBuffer = await servicios.downloadFactureXml(id);
          fileType = 'application/xml';
          break;
        case 'zip':
          fileBuffer = await servicios.downloadFactureZip(id);
          fileType = 'application/zip';
          break;
        default:
          return res.status(400).json({
            error: 'Tipo de archivo no válido. Use "pdf", "xml" o "zip".',
          });
      }

      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', fileType);
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      res
        .status(500)
        .json({ error: `Error al descargar el archivo: ${error.message}` });
    }
  }
);

router.post(
  '/preview',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ error: 'El ID del documento es obligatorio' });
      }

      // 🔹 Obtener el PDF desde la base de datos
      const { pdf } = await serviciosDB.obtenerArchivosFacturaDB(id);

      if (!pdf) {
        return res
          .status(404)
          .json({ error: 'No se encontró el PDF para esta factura.' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename=factura_${id}.pdf`
      );

      // 🔹 Enviar el blob del PDF directamente como en el preview original
      res.send(pdf);
    } catch (error) {
      console.error('Error al previsualizar el PDF:', error);
      res.status(500).json({ error: 'Error al previsualizar la factura' });
    }
  }
);

//Ruta que obtiene los archivos de una factura almacenados en la base de datos
router.get(
  '/archivosFacturaDB/:id&:tipo',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id, tipo } = req.params;

    try {
      const archivos = await serviciosDB.obtenerArchivosFacturaDB(id);

      let fileBuffer;
      let fileType;
      let fileName = `factura_${id}.${tipo}`;

      if (tipo === 'pdf' && archivos.pdf) {
        fileBuffer = archivos.pdf;
        fileType = 'application/pdf';
      } else if (tipo === 'xml' && archivos.xml) {
        fileBuffer = archivos.xml;
        fileType = 'application/xml';
      } else if (tipo === 'zip' && archivos.zip) {
        fileBuffer = archivos.zip;
        fileType = 'application/zip';
      } else {
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }

      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', fileType);
      res.send(fileBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

//Ruta para obtener todas las facturas
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const facturas = await servicios.findFactureAll();
      res.status(200).json(facturas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

//Ruta para obtener todas las facturas de un cliente, se envia el id del cliente y el tipo de factura
router.get(
  '/customer/facture',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id, type } = req.query;
    try {
      const facturas = await servicios.findFactureByCustumer(id, type);
      res.status(200).json(facturas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

//Ruta para obtener todas las facturas de un cliente, se envia el id del cliente
router.get('/customer/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const facturas = await servicios.allDocumentsByCustumer(id);
    res.status(200).json(facturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Ruta para obtener una factura por su id
router.get(
  '/factura/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const factura = await servicios.findFactureById(id);
      res.status(200).json(factura);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

//Ruta para filtrar facturas por cliente, tipo y rango de fechas. (se puede aplicar uno, dos o los tres filtros)
router.get(
  '/filtros',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  checkSchema(filterFacturacionSchema),
  validateRequest,
  async (req, res) => {
    try {
      const { customer, types, gte, lte } = req.query;
      const filters = {};
      if (customer) filters.customer = customer;
      if (types) filters.types = types.split(',');
      if (gte || lte) {
        filters.date = {};
        if (gte) filters.date.gte = new Date(gte).toISOString();
        if (lte) filters.date.lte = new Date(lte).toISOString();
      }

      const facturas = await servicios.findFacturesByFilters(filters);

      res.status(200).json(facturas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

//Ruta para cancelar una factura
router.delete(
  '/factura/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo'),
  checkSchema(cancelFacturacionSchema),
  validateRequest,
  async (req, res) => {
    const { id } = req.params;
    const { motive } = req.query;

    try {
      const response = await servicios.cancelarFactura(id, motive);
      res.status(200).json(response);
    } catch (error) {
      console.error('Error al cancelar la factura:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  '/factura/copy',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id } = req.body;
    try {
      const factura = await servicios.copyFactureDraft(id);
      res.status(200).json(factura);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  '/factura/sendEmailFacture',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id, emails } = req.body; // Recibimos el ID de la factura y el array de emails

    try {
      // Validar que `emails` sea un array con al menos un correo
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({
          error:
            'Se debe proporcionar al menos un correo electrónico válido en el array "emails"',
        });
      }

      // Llamamos al servicio con el array de emails
      const emailResponse = await servicios.sendEmailFacure(id, emails);

      res.status(200).json({ message: 'Email enviado', data: emailResponse });
    } catch (error) {
      console.error('Error al enviar correo:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  '/factura/updateStatus/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  checkSchema(updateStatusFacturacionSchema),
  validateRequest,
  async (req, res) => {
    const { id } = req.params;
    try {
      const status = await servicios.updateStatusFacture(id);
      res.status(200).json({ message: 'Estado actualizado', data: status });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  '/total',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (_, res) => {
    try {
      const totalFacturado = await servicios.calcularTotalesFacturacionYCobranza();
      res.status(200).json({ totalFacturado });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  '/totales-graficas',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;

      const totales = await servicios.totalesGraficas(
        fechaInicio,
        fechaFin
      );

      res.status(200).json(totales);
    } catch (error) {
      console.error('Error al obtener los totales:', error);
      res.status(500).json({ error: error.message });
    }
  }
)

router.get(
  '/estado-cuenta-excel',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {

      const {id, fechaInicio, fechaFin } = req.query;


      // Buscar al cliente por id_facturapi
      const cliente = await models.Clientes.findOne({
        where: { id_facturapi: id },
      });

      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      // Buscar facturas usando el id_cliente interno
      const facturas = await serviciosDB.findFacturesByDBFilters({
        idCliente: cliente.id_cliente,
        fechaInicio,
        fechaFin,
      });

      const facturasValidas = facturas.filter(
        (factura) => factura.estado !== 'cancelada'
      );

      // Obtener los datos del cliente desde Facturapi
      const clienteFacturapiData = await serviciosClientes.buscarUnoFacturapi(id);

      const excelBuffer = await servicios.generarEstadoDeCuentaExcel(
        facturasValidas,
        clienteFacturapiData
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=estado_cuenta_${id}.xlsx`
      );

      res.send(excelBuffer);
    } catch (error) {
      console.error('Error al generar Excel de estado de cuenta:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  '/acuse-cancelacion/:id',
  passport.authenticate('jwt', { session: false }), 
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const pdfBuffer = await servicios.dowloadAcuseCancelacionPDF(id);

      if (!pdfBuffer || pdfBuffer.length === 0) {
        return res
          .status(404)
          .json({ error: 'No se pudo obtener el acuse de cancelación' });
      }

      // Configurar cabeceras para enviar el archivo PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=acuse_cancelacion_${id}.pdf`
      );

      // Enviar el buffer como respuesta
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error al generar acuse de cancelación:', error);
      res
        .status(500)
        .json({ error: 'Error al generar el acuse de cancelación' });
    }
  }
);

module.exports = router;
