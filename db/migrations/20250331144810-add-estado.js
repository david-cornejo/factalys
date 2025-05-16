'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('facturacion', 'estado', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'valida', // por defecto todas serán válidas
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('facturacion', 'estado');
  },
};
