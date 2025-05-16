'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('facturacion', 'inicio', {
      allowNull: true,
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('facturacion', 'fin', {
      allowNull: true,
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('facturacion', 'inicio');
    await queryInterface.removeColumn('facturacion', 'fin');
  },
};
