const jwt = require('jsonwebtoken');

/**
 * Decodifica el token JWT y devuelve los datos del payload.
 * @param {string} authHeader - El header Authorization de la petición.
 * @returns {object|null} - Los datos decodificados del token o null si no es válido.
 */
function decodeToken(authHeader) {
  if (!authHeader) {
    throw new Error('Authorization header no proporcionado');
  }

  const token = authHeader.split(' ')[1]; // Extraer el token después de "Bearer"
  if (!token) {
    throw new Error('Token no proporcionado');
  }

  try {
    // Decodificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Asegúrate de configurar JWT_SECRET en tu entorno
    return decoded;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

module.exports = { decodeToken };