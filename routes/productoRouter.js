const express = require('express');
const passport = require('passport');
const { checkSchema } = require('express-validator');
const { validateRequest } = require('../middlewares/validarHandler');
const {
  createProductoSchema,
  updateProductoSchema,
  deleteProductoSchema,
} = require('../middlewares/validations/productoValidation');
const { checkRoles } = require('./../middlewares/authHandler');
const serviciosServicios = require('../service/productoService');

const router = express.Router();
const servicios = new serviciosServicios();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const productos = await servicios.buscar();
    res.json(productos);
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id } = req.params;
    const productos = await servicios.buscarUno(id);
    res.json(productos);
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo'),
  checkSchema(createProductoSchema),
  validateRequest,
  async (req, res) => {
    const body = req.body;
    const nuevoProducto = await servicios.crear(body);
    res.status(201).json(nuevoProducto);
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo'),
  checkSchema(updateProductoSchema),
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

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super'),
  checkSchema(deleteProductoSchema),
  validateRequest,
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

module.exports = router;
