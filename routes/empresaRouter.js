const express = require('express');
const passport = require('passport');
const { checkSchema } = require('express-validator');
const { validateRequest } = require('../middlewares/validarHandler');
const {
  createEmpresaSchema,
  updateEmpresaSchema,
} = require('../middlewares/validations/empresaValidation');
const { checkRoles } = require('./../middlewares/authHandler');
const empresaServicios = require('../service/empresaService');

const router = express.Router();
const servicios = new empresaServicios();

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
  checkRoles('super'),
  checkSchema(createEmpresaSchema),
  validateRequest,
  async (req, res) => {
    const body = req.body;
    try {
      const nuevaEmpresa = await servicios.crear(body);
      res.status(201).json(nuevaEmpresa);
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super'),
  checkSchema(updateEmpresaSchema),
  validateRequest,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const empresa = await servicios.actualizar(id, body);
      res.json(empresa);
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
