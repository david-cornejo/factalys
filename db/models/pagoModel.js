const { Model, DataTypes } = require('sequelize');
const { FACTURACION_TABLE } = require('./facturacion');

const PAGO_TABLE = 'pago';

const PagoSchema = {
  id_facturacion: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
  },
  id_factura: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: FACTURACION_TABLE,
      key: 'id_facturacion',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  fecha_emision: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  total: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  tipo_factura: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  estadoDePago: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  folio: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  serieSucursal: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  contrato: {
    allow: true,
    type: DataTypes.STRING,
  },
  atendida: {
    allowNull: true,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  fecha_inicio: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  fecha_fin: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  id_cliente: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  id_sucursal: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  id_usuario_creador: {
    allowNull: true,
    type: DataTypes.INTEGER,
  },
  estado: {
    allowNull: true,
    type: DataTypes.STRING,
    defaultValue: 'valida',
  },
};

class Pago extends Model {
  static associate(models) {
    this.belongsTo(models.Facturacion, {
      as: 'factura',
      foreignKey: 'id_factura',
    });
    this.belongsTo(models.Clientes, {
      as: 'clientes',
      foreignKey: 'id_cliente',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PAGO_TABLE,
      modelName: 'Pago',
      timestamps: false,
    };
  }
}

module.exports = { PAGO_TABLE, PagoSchema, Pago };
