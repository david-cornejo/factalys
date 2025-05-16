'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('facturacion', 'estadoDePago', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('facturacion', 'folio', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('facturacion', 'estadoDePago');
    await queryInterface.removeColumn('facturacion', 'folio');
  },
};
