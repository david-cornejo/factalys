'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('facturacion', 'fecha_inicio', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('facturacion', 'fecha_fin', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('facturacion', 'fecha_inicio');
    await queryInterface.removeColumn('facturacion', 'fecha_fin');
  },
};
