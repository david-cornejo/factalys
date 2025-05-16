'use strict';

const { REP_TABLE, RepSchema } = require('../models/repModel');
const {
  NOTA_CREDITO_TABLE,
  NotaCreditoSchema,
} = require('../models/notaCreditoModel');
const { PAGO_TABLE, PagoSchema } = require('../models/pagoModel');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable(REP_TABLE, RepSchema);
    await queryInterface.createTable(NOTA_CREDITO_TABLE, NotaCreditoSchema);
    await queryInterface.createTable(PAGO_TABLE, PagoSchema);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(PAGO_TABLE);
    await queryInterface.dropTable(NOTA_CREDITO_TABLE);
    await queryInterface.dropTable(REP_TABLE);
  },
};
