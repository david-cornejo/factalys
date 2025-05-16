const { models } = require('../libs/sequelize');

class domicilioFiscalServicios {
  constructor() {
    this.domicilioFiscal = [];
  }

  async crear(data) {
    const newDomicilio = await models.domicilioFiscal.create(data);
    return newDomicilio;
  }
}

module.exports = domicilioFiscalServicios;
