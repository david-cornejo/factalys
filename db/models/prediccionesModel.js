// models/prediccion.js
'use strict';

const { Model, DataTypes } = require('sequelize');
const { EMPRESA_TABLE } = require('./empresaModel');

const PREDICCIONES_TABLE = 'Predicciones';

const PrediccionSchema = {
  id_prediccion: {
    field: 'id_prediccion',
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  anio: {
    field: 'anio',
    allowNull: false,
    type: DataTypes.INTEGER
  },
  mes: {
    field: 'mes',
    allowNull: false,
    type: DataTypes.INTEGER
  },
  monto_predicho: {
    field: 'monto_predicho',
    allowNull: true,
    type: DataTypes.FLOAT
  },
  monto_real: {
    field: 'monto_real',
    allowNull: true,
    type: DataTypes.FLOAT, 
    defaultValue: null
  },
  desviacion: {
    field: 'desviacion',
    allowNull: true,
    type: DataTypes.FLOAT,
    defaultValue: null
  },
  fecha_actualizacion: {
    field: 'fecha_actualizacion',
    allowNull: true,
    type: DataTypes.DATE,
    defaultValue: null
  },
  id_empresa: {
    field: 'id_empresa',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: EMPRESA_TABLE,
      key: 'id_empresa'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  }
};

class Prediccion extends Model {
  static associate(models) {
    this.belongsTo(models.Empresa, {
      as: 'empresa',
      foreignKey: 'id_empresa'
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PREDICCIONES_TABLE,
      modelName: 'Prediccion',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    };
  }
}

module.exports = { PREDICCIONES_TABLE, PrediccionSchema, Prediccion };