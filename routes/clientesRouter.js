const express = require('express');
const passport = require('passport');
const { checkSchema } = require('express-validator');
const { validateRequest } = require('./../middlewares/validarHandler');
const {
  createClienteSchema,
  updateClienteSchema,
} = require('./../middlewares/validations/clienteValidation');
const { checkRoles } = require('./../middlewares/authHandler');
const clientesServicios = require('../service/clienteService');

const router = express.Router();
const servicios = new clientesServicios();

//Ruta para obtener todos los clientes
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const clientes = await servicios.buscar();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

//Ruta para obtener un cliente por su ID en la base de datos
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const clientes = await servicios.buscarUno(id);
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

//Ruta para obtener un cliente por su ID en Facturapi
router.get(
  '/customer-factuapi/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const customer = await servicios.bucarUnoFacturapi(id);
      res.status(200).json(customer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

//Ruta para obtener los clientes de una sucursal
router.get(
  '/sucursal/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id) || id.trim() === '' || id === 'undefined') {
      return res.status(400).json({
        error: 'El id de la sucursal es requerido y debe ser un número válido',
      });
    }
    try {
      const clientes = await servicios.obtenerClientesPorSucursal(id);
      res.status(200).json(clientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

//Ruta para crear un cliente
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  checkSchema(createClienteSchema),
  validateRequest,
  async (req, res) => {
    const body = req.body;
    try {
      const nuevoCliente = await servicios.crear(body);
      const idFacturapi = await servicios.actualizar(
        nuevoCliente.cliente.id_cliente,
        {
          id_facturapi: nuevoCliente.customer.id,
        }
      );
      res.status(201).json(idFacturapi);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.post(
  '/crearClienteDB',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const body = req.body;
    try {
      const nuevoCliente = await servicios.crearClienteDB(body);
      res.status(201).json(nuevoCliente);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  checkSchema(updateClienteSchema),
  validateRequest,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const product = await servicios.actualizar(id, body);
      res.json(product);
    } catch (error) {
      res.status(404).json({
        message: error.message,
      });
    }
  }
);

router.patch(
  '/actualizarEnFacturapi/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  checkSchema(updateClienteSchema),
  validateRequest,
  async (req, res) => {
    const { id } = req.params; // id de Facturapi recibido en la petición
    const body = req.body; // Se espera que el body contenga email_cliente y/o telefono_cliente
    try {
      const clienteActualizado = await servicios.actualizarDatosPorFacturapi(
        id,
        body
      );
      res.json(clienteActualizado);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const productBorrado = await servicios.borrar(id);
      res.json(productBorrado);
    } catch (error) {
      res.status(404).json({
        message: error.message,
      });
    }
  }
);

router.post('/clienteInteresado', async (req, res) => {
  try {
    const { nombre, apellido, correo } = req.body;
    const interesado = await servicios.registrarInteresado(
      nombre,
      apellido,
      correo
    );
    res.status(201).json({ message: 'Registro exitoso', interesado });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Hubo un problema al registrar el interesado' });
  }
});

module.exports = router;
