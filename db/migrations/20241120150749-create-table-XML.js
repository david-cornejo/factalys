'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('facturasXML', {
      id_xml: {
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('facturasXML');
  },
};
