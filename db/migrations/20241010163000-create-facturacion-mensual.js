'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('facturacion_mensual', {
      id_facturacion_mensual: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      anio: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      mes: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      total_facturado: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      }
    });

    //se agregó esta restriccion para evitar duplicados en la tabla
    await queryInterface.addConstraint('facturacion_mensual', {
      fields: ['anio', 'mes'],
      type: 'unique',
      name: 'unique_facturacion_mensual_anio_mes'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('facturacion_mensual');
  }
};
