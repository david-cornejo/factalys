const express = require('express');
const passport = require('passport');
const { checkRoles } = require('../middlewares/authHandler');
const asesorService = require('../service/asesorService');

const router = express.Router();
const servicio = new asesorService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo'),
  async (req, res) => {
    const asesores = await servicio.buscarTodos();
    res.json(asesores);
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const asesor = await servicio.buscarUno(id);
      res.json(asesor);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo'),
  async (req, res) => {
    const body = req.body;
    const nuevoAsesor = await servicio.crear(body);
    res.status(201).json(nuevoAsesor);
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo'),
  async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    try {
      const actualizado = await servicio.actualizar(id, body);
      res.json(actualizado);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const eliminado = await servicio.eliminar(id);
      res.json(eliminado);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
);

router.get(
  '/facturas/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const facturas = await servicio.obtenerFacturasPorAsesor(id);
      res.status(200).json(facturas);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

module.exports = router;
