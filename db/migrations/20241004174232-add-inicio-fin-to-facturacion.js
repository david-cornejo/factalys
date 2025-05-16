'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('facturacion', 'inicio', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.addColumn('facturacion', 'fin', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('facturacion', 'inicio');
    await queryInterface.removeColumn('facturacion', 'fin');
  }
};
