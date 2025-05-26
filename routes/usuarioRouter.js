const express = require('express');
const passport = require('passport');
const { checkSchema } = require('express-validator');
const { validateRequest } = require('../middlewares/validarHandler');
const {
  createUsuarioSchema,
  updateUsuarioSchema,
} = require('../middlewares/validations/usuarioValidation');
const { checkRoles } = require('./../middlewares/authHandler');
const usuarioServicios = require('../service/usuarioService');

const router = express.Router();
const servicios = new usuarioServicios();

// Obtener todos los usuarios
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const usuarios = await servicios.buscar();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Obtener un usuario por ID
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await servicios.buscarUno(id);
      res.json(usuario);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
);

// Crear un usuario
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super'),
  checkSchema(createUsuarioSchema), 
  validateRequest, 
  async (req, res) => {
    try {
      const body = req.body;
      const nuevoUsuario = await servicios.crear(body);
      res.status(201).json(nuevoUsuario);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Actualizar un usuario (usando token para identificar al usuario)
router.patch(
  '/:token',
  passport.authenticate('jwt', { session: false }),
  checkSchema(updateUsuarioSchema), 
  validateRequest,
  async (req, res) => {
    try {
      const { token } = req.params;
      const body = req.body;
      const usuarioActualizado = await servicios.actualizar(token, body);
      res.json(usuarioActualizado);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
);

// Actualizar sucursal del usuario
router.patch(
  '/sucursal/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super'),
  checkSchema(updateUsuarioSchema), 
  validateRequest, 
  async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const usuarioActualizado = await servicios.actualizarSucursal(id, body);
      res.json(usuarioActualizado);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
);

// Eliminar un usuario
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const usuarioBorrado = await servicios.borrar(id);
      res.json(usuarioBorrado);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
);

module.exports = router;
