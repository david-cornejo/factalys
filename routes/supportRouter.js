const express = require('express');
const SupportService = require('../service/supportService');
const passport = require('passport');
const { checkSchema } = require('express-validator');
const { validateRequest } = require('../middlewares/validarHandler');
const supportValidationSchema = require('../middlewares/validations/supportValidation');

const router = express.Router();
const supportService = new SupportService();

// Ruta para enviar correos de soporte
router.post(
  '/send-support',
  passport.authenticate('jwt', { session: false }),
  checkSchema(supportValidationSchema),
  validateRequest,
  async (req, res) => {
    try {
      const response = await supportService.sendSupportEmail(req.body);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
