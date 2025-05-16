'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('asesores', {
      id_asesor: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nombre: {
        allowNull: false,
        type: Sequelize.STRING,
      },
    });

    await queryInterface.createTable('asesores_facturas', {
      id_factura: {
        type: Sequelize.STRING,
        references: {
          model: 'facturacion',
          key: 'id_facturacion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_asesor: {
        type: Sequelize.INTEGER,
        references: {
          model: 'asesores',
          key: 'id_asesor',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('asesores_facturas');
    await queryInterface.dropTable('asesores');
  },
};
