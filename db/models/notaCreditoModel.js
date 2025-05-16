const { Model, DataTypes } = require('sequelize');
const { FACTURACION_TABLE } = require('./facturacion');

const NOTA_CREDITO_TABLE = 'nota_credito';

const NotaCreditoSchema = {
  id_facturacion: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
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

class NotaCredito extends Model {
  static associate(models) {
    this.belongsTo(models.Clientes, {
      as: 'clientes',
      foreignKey: 'id_cliente',
    });

    this.belongsToMany(models.Facturacion, {
      through: 'factura_nota_credito',
      as: 'facturas',
      foreignKey: 'id_nota_credito',
      otherKey: 'id_factura',
      timestamps: false,
    });
    
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: NOTA_CREDITO_TABLE,
      modelName: 'NotaCredito',
      timestamps: false,
    };
  }
}


module.exports = { NOTA_CREDITO_TABLE, NotaCreditoSchema, NotaCredito };
