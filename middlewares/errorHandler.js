function logErrors(err, req, res, next) {
  next(err);
}

function errorHandler(err, req, res, next) {
  console.error(err.stack); // Muestra el error en la consola para propósitos de depuración

  const statusCode = err.status || 500; // Código de estado (por defecto, 500)
  const message = err.message || 'Error interno del servidor'; // Mensaje del error
  const errors = err.errors || null; // Si hay errores de validación, inclúyelos

  res.status(statusCode).json({
    message,
    ...(errors && { errors }), // Solo incluye los errores si existen
  });
}

module.exports = { logErrors, errorHandler };
