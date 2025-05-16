const express = require('express');
const passport = require('passport');
const { checkSchema } = require('express-validator');
const { validateRequest } = require('../middlewares/validarHandler');
const {
  createSucursalSchema,
  updateSucursalSchema,
} = require('../middlewares/validations/sucursalValidation');
const { checkRoles } = require('./../middlewares/authHandler');
const sucursalServicios = require('../service/sucursalService');

const router = express.Router();
const servicios = new sucursalServicios();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const sucursal = await servicios.buscar();
    res.json(sucursal);
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id } = req.params;
    const sucursal = await servicios.buscarUno(id);
    res.json(sucursal);
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super'),
  checkSchema(createSucursalSchema),
  validateRequest,
  async (req, res) => {
    const body = req.body;
    const nuevaSucursal = await servicios.crear(body);
    res.status(201).json(nuevaSucursal);
  }
);

router.post(
  '/crear-muchos',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super'),
  async (req, res) => {
    const body = req.body;
    const nuevaSucursal = await servicios.crearMuchos(body);
    res.status(201).json(nuevaSucursal);
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super'),
  checkSchema(updateSucursalSchema),
  validateRequest,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const sucursal = await servicios.actualizar(id, body);
      res.json(sucursal);
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
      const sucursalBorrado = await servicios.borrar(id);
      res.json(sucursalBorrado);
    } catch (error) {
      res.status(404).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;
