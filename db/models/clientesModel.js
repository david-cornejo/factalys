const { Model, DataTypes, Sequelize } = require('sequelize');
const { SUCURSAL_TABLE } = require('./sucursalModel');

const CLIENTES_TABLE = 'clientes';

const ClientesSchema = {
  id_cliente: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nombre_cliente: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: false,
  },
  email_cliente: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: false,
  },
  rfc_cliente: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: false,
  },
  tax_system_cliente: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: false,
  },
  telefono_cliente: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: false,
  },
  id_facturapi: {
    allowNull: true,
    type: DataTypes.STRING,
    unique: true,
  },
};

class Clientes extends Model {
  static associate(models) {
    this.hasMany(models.DomicilioFiscal, {
      as: 'domicilio_fiscal',
      foreignKey: 'id_cliente',
    });
    this.hasMany(models.Facturacion, { 
      as: 'facturacion',
      foreignKey: 'id_cliente',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CLIENTES_TABLE,
      modelName: 'Clientes',
      timestamps: false,
    };
  }
}

module.exports = { CLIENTES_TABLE, ClientesSchema, Clientes };
