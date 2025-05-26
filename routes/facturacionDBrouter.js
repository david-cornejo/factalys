const express = require('express');
const FacturaEstadoServicios = require('../service/facturacionDBservice');
const facturacionServicios = require('../service/facturacionService');
const passport = require('passport');
const { checkRoles } = require('./../middlewares/authHandler');
const { decodeToken } = require('../utils/tokenUtils'); 
const router = express.Router();
const servicios = new FacturaEstadoServicios();
const serviciosFact = new facturacionServicios();

router.get(
  '/filtrosDB',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const decodedToken = decodeToken(req.headers['authorization']);
      const serieSucursalFromToken = decodedToken.clave; 
    
      const {
        rfcCliente,
        fechaInicio,
        fechaFin,
        tipos,
        estadosPago,
        serieSucursal,
        customer,
      } = req.query;

      const filters = {
        rfcCliente,
        fechaInicio,
        fechaFin,
        tipos: tipos ? tipos.split(',') : [],
        estadosPago: estadosPago ? estadosPago.split(',') : [],
        serieSucursal: serieSucursal ? serieSucursal.split(',') : [serieSucursalFromToken], 
        customer,
      };

      const facturas = await servicios.findFacturesByDBFilters(filters);

      res.status(200).json(facturas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  '/reporte-global',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const { fechaInicio, fechaFin, estadosPago, rfcCliente, serieSucursal } = req.query;

      const decodedToken = decodeToken(req.headers['authorization']);
      const serieSucursalFromToken = decodedToken.clave; 

      const filters = {
        fechaInicio,
        fechaFin,
        estadosPago: estadosPago ? estadosPago.split(',') : [],
        serieSucursal: serieSucursal ? serieSucursal.split(',') : [serieSucursalFromToken], 
        rfcCliente,
      };

      const facturas = await servicios.findFacturesByDBFilters(filters);
      const facturasFiltradas = facturas.filter(
        (factura) => factura.estado !== 'cancelada')
        .sort((a, b) => new Date(a.fecha_emision) - new Date(b.fecha_emision));

      const pdfBuffer = await servicios.generarReporteGlobal(
        facturasFiltradas,
        fechaInicio,
        fechaFin
      );

      res.setHeader(
        'Content-Disposition',
        'attachment; filename=reporte_global.pdf'
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error al generar el reporte global:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  '/reporte-global-excel',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const { fechaInicio, fechaFin, estadosPago, rfcCliente, serieSucursal } = req.query;
      const decodedToken = decodeToken(req.headers['authorization']);
      const serieSucursalFromToken = decodedToken.clave; 

      const excelBuffer = await servicios.generarReporteGlobalExcel({
        fechaInicio,
        fechaFin,
        estadosPago,
        rfcCliente,
        serieSucursal: serieSucursal ? serieSucursal.split(',') : [serieSucursalFromToken], 
      });

      res.setHeader(
        'Content-Disposition',
        'attachment; filename=reporte_global.xlsx'
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.send(excelBuffer);
    } catch (error) {
      console.error('Error al generar el reporte global en Excel:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  '/atender/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id } = req.params;

    try {
      const resultado = await servicios.marcarFacturaAtendida(id);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  '/crearPago',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const {
        id_facturacion,
        fecha_emision,
        total,
        tipo_factura,
        folio,
        id_cliente,
        estadoDePago,
        serieSucursal,
        id_sucursal,
        contrato,
        fecha_inicio,
        fecha_fin,
        id_usuario_creador,
        cliente,
        fecha_pago,
        monto,
        documentos,
      } = req.body;

      const facturaPDC = await serviciosFact.newFactureDB({
        fecha_emision,
        total,
        tipo_factura,
        id_facturacion, 
        folio,
        id_cliente,
        estadoDePago,
        serieSucursal,
        id_sucursal,
        contrato: contrato || null,
        fecha_inicio: fecha_inicio || null,
        fecha_fin: fecha_fin || null,
        id_usuario_creador,
      });

      await servicios.crearPDFPagoCliente({
        id_factura: facturaPDC.id_facturacion,
        cliente: {
          nombre: cliente?.nombre || 'Sin nombre',
          rfc: cliente?.rfc || 'Sin RFC',
        },
        fecha_pago,
        monto,
        folio,
        serieSucursal,
        documentos,
      });

      res.status(201).json({
        message: 'Factura PDC creada y PDF de pago almacenado con éxito.',
        facturaPDC,
      });
    } catch (error) {
      console.error('Error al crear Factura PDC y PDF de pago:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  '/generarPDFPago',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const {
        id_factura,
        cliente,
        fecha_pago,
        monto,
        folio,
        serieSucursal,
        documentos,
      } = req.body;

      await servicios.crearPDFPagoCliente({
        id_factura,
        cliente: {
          nombre: cliente?.nombre || 'Sin nombre',
          rfc: cliente?.rfc || 'Sin RFC',
        },
        fecha_pago,
        monto,
        folio,
        serieSucursal,
        documentos,
      });

      res.status(201).json({
        message: 'PDF de pago generado y almacenado con éxito.',
      });
    } catch (error) {
      console.error('Error al generar el PDF de pago:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/reporte-saldos-clientes', async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin, serieSucursal } = req.query;

    const decodedToken = decodeToken(req.headers['authorization']);
    const serieSucursalFromToken = decodedToken.clave;

    const buffer = await servicios.generarReporteSaldosClientesExcel({
      fechaInicio,
      fechaFin,
      serieSucursal: serieSucursal || serieSucursalFromToken,
    });

    res.setHeader('Content-Disposition', 'attachment; filename=saldos_clientes.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/reporte-antiguedad-saldos-excel',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const { fechaCorte, serieSucursal } = req.query;
      const decodedToken = decodeToken(req.headers['authorization']);
      const sucursales = serieSucursal ? serieSucursal.split(',') : [decodedToken.clave];

      const buffer = await servicios.generarReporteAntiguedadSaldosExcel({ fechaCorte, serieSucursal: sucursales });

      res.setHeader('Content-Disposition', 'attachment; filename=antiguedad_saldos_clientes.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Error al generar el reporte de antigüedad de saldos:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/saldos-clientes', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const resultado = await servicios.obtenerResumenSaldosClientes({
      fechaInicio,
      fechaFin,
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener saldos de clientes:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get(
  '/total-db',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const decoded = decodeToken(req.headers.authorization);
      const serieSucursal = decoded.clave; 

      const totals = await servicios.calcularTotalesFacturacionYCobranzaDB({ serieSucursal });
      res.status(200).json(totals);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get(
  '/totales-graficas-db',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const decoded = decodeToken(req.headers.authorization);
      const serieSucursal = decoded.clave;

      const { fechaInicio, fechaFin } = req.query;
      const chartData = await servicios.totalesGraficasDB({
        fechaInicio,
        fechaFin,
        serieSucursal
      });
      res.status(200).json(chartData);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get(
  '/data-prediccion',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super','corporativo','sucursal'),
  async (req, res) => {
    try {
      decodeToken(req.headers.authorization); 
      const { fechaInicio, fechaFin } = req.query;
      const data = await servicios.dataPrediccionGraficasDB({ fechaInicio, fechaFin });
      res.json(data);
    } catch (err) {
      console.error('Error en /data-prediccion:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
