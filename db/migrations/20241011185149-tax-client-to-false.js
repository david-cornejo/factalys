'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('clientes', 'tax_system_cliente', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false, // El cambio realizado
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('clientes', 'tax_system_cliente', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, // Reversión al valor original en caso de deshacer la migración
    });
  }
};
