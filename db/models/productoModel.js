const { Model, DataTypes, Sequelize } = require('sequelize');
const { EMPRESA_TABLE } = require('./empresaModel');

const PRODUCTO_TABLE = 'producto';

const ProductoSchema = {
  id_producto: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nombre_producto: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  precio_unidad_producto: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  familia_producto: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  id_sat_producto: {
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

class Producto extends Model {
  static associate(models) {
    this.belongsTo(models.Empresa, {
      as: 'empresa',
      foreignKey: 'id_empresa',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: PRODUCTO_TABLE,
      modelName: 'Producto',
      timestamps: false,
    };
  }
}

module.exports = { PRODUCTO_TABLE, ProductoSchema, Producto };
