const { Model, DataTypes, Sequelize } = require('sequelize');
const { CLIENTES_TABLE } = require('./clientesModel');

const DOMICILIO_FISCAL_TABLE = 'domicilio_fiscal';

const DomicilioFiscalSchema = {
  id_domicilio_fiscal: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  codigo_postal: {
    // zip
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  calle: {
    // street
    allowNull: true,
    type: DataTypes.STRING,
  },
  numero_exterior: {
    // exterior
    allowNull: true,
    type: DataTypes.INTEGER,
  },
  numero_interior: {
    // interior
    allowNull: true,
    type: DataTypes.INTEGER,
  },
  colonia: {
    // neighborhood
    allowNull: true,
    type: DataTypes.STRING,
  },

  ciudad: {
    // city
    allowNull: true,
    type: DataTypes.STRING,
  },
  municipio: {
    // municipality
    allowNull: true,
    type: DataTypes.STRING,
  },
  estado: {
    // state
    allowNull: true,
    type: DataTypes.STRING,
  },
  pais: {
    // country
    allowNull: true,
    type: DataTypes.STRING,
  },
  id_cliente: {
    field: 'id_cliente',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CLIENTES_TABLE,
      key: 'id_cliente',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
};

class DomicilioFiscal extends Model {
  static associate(models) {
    this.belongsTo(models.Clientes, {
      as: 'clientes',
      foreignKey: 'id_cliente',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: DOMICILIO_FISCAL_TABLE,
      modelName: 'DomicilioFiscal',
      timestamps: false,
    };
  }
}

module.exports = {
  DOMICILIO_FISCAL_TABLE,
  DomicilioFiscalSchema,
  DomicilioFiscal,
};
