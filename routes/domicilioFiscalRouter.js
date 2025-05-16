const express = require('express');
const passport = require('passport');
const { checkRoles } = require('./../middlewares/authHandler');
const domicilioFiscalServicios = require('../service/domicilioFiscalService');

const router = express.Router();
const servicios = new domicilioFiscalServicios();

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('super', 'corporativo', 'sucursal'),
  async (req, res) => {
    const data = req.body;
    try {
      const domicilio = await servicios.crear(data);
      res.json(domicilio);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;