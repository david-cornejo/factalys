const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const { config } = require('../config/config');

const usuarioServicios = require('./usuarioService');
const sucursalServicios = require('./sucursalService');
const service = new usuarioServicios();
const serviceSucursal = new sucursalServicios();

class PorfileService {
  async getData(token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const userData = await service.buscarUno(payload.sub);
      return userData;
    } catch (error) {
      throw boom.unauthorized();
    }
  }

  async getDataTeam(token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const userData = await serviceSucursal.buscarUno(payload.sucursal);
      return userData;
    } catch (error) {
      throw boom.unauthorized();
    }
  }
}

module.exports = PorfileService;
