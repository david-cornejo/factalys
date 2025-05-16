'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('facturacion_mensual', 'sucursal', {
      allowNull: false,
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('facturacion_mensual', 'sucursal');
  }
};
