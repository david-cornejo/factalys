'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('facturacion', 'atendida', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false, // 🔹 Valor por defecto `false`
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('facturacion', 'atendida');
  },
};
