const { Model, DataTypes, Sequelize } = require('sequelize');

const EMPRESA_TABLE = 'empresa';

const EmpresaSchema = {
  id_empresa: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  domicilio_fiscal_empresa: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  nombre_empresa: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
};

class Empresa extends Model {
  static associate(models) {
    this.hasMany(models.Sucursal, {
      as: 'sucursal',
      foreignKey: 'id_empresa',
    });
    this.hasMany(models.Servicios, {
      as: 'servicios',
      foreignKey: 'id_empresa',
    });
    this.hasMany(models.Producto, {
      as: 'productos',
      foreignKey: 'id_empresa',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: EMPRESA_TABLE,
      modelName: 'Empresa',
      timestamps: false,
    };
  }
}

module.exports = { EMPRESA_TABLE, EmpresaSchema, Empresa };
