const { validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación y devolver solo los mensajes de error.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extraer solo los mensajes de error
    const errorMessages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      message: 'Errores de validación',
      errors: errorMessages, // Devuelve un array con los mensajes específicos
    });
  }
  next();
};

module.exports = {
  validateRequest,
};
