'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('facturacion', 'inicio');
    await queryInterface.removeColumn('facturacion', 'fin');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('facturacion', 'inicio', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('facturacion', 'fin', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
};
