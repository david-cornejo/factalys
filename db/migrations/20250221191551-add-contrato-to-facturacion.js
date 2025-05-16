'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('facturacion', 'contrato', {
      type: Sequelize.STRING,
      allowNull: true, // Ajusta si debe ser obligatorio
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('facturacion', 'contrato');
  },
};
