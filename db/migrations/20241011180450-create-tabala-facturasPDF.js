'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('facturasPDF', {
      id_pdf: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      archivo: {
        allowNull: false,
        type: Sequelize.BLOB('long'),
      },
      id_factura: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'facturacion', 
          key: 'id_facturacion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('facturasPDF');
  }
};
