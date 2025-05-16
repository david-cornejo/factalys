
const moment = require('moment-timezone');

/**
 * Convierte una fecha a formato CDMX.
 * @param {Date | string} date - La fecha a formatear.
 * @param {string} format - El formato de salida.
 * @returns {string} Fecha formateada.
 */


function formatToCDMX(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment.utc(date).tz('America/Mexico_City').format(format);
  }

module.exports = formatToCDMX;
