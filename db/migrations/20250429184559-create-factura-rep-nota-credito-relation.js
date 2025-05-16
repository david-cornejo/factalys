'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('factura_rep', {
      id_factura: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        references: {
          model: 'facturacion',
          key: 'id_facturacion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_rep: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        references: {
          model: 'rep',
          key: 'id_facturacion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.createTable('factura_nota_credito', {
      id_factura: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        references: {
          model: 'facturacion',
          key: 'id_facturacion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_nota_credito: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        references: {
          model: 'nota_credito',
          key: 'id_facturacion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('factura_nota_credito');
    await queryInterface.dropTable('factura_rep');
  },
};
