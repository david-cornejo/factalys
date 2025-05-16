const { Model, DataTypes, Sequelize } = require('sequelize');
const { EMPRESA_TABLE } = require('./empresaModel');

const SERVICIOS_TABLE = 'servicios';

const ServiciosSchema = {
  id_servicio: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nombre_servicio: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  precio_servicio: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  familia_servicio: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  id_sat_servicio: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  id_empresa: {
    field: 'id_empresa',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: EMPRESA_TABLE,
      key: 'id_empresa',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
};

class Servicios extends Model {
  static associate(models) {
    this.belongsTo(models.Empresa, {
      as: 'empresa',
      foreignKey: 'id_empresa',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: SERVICIOS_TABLE,
      modelName: 'Servicios',
      timestamps: false,
    };
  }
}

module.exports = { SERVICIOS_TABLE, ServiciosSchema, Servicios };
