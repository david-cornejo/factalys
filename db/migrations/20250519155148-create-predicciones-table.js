'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Predicciones', {
      id_prediccion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      anio: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      mes: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      monto_predicho: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      monto_real: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null
      },
      desviacion: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null
      },
      fecha_actualizacion: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      id_empresa: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'empresa',
          key: 'id_empresa'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Predicciones');
  }
};