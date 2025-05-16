const { Model, DataTypes } = require('sequelize');
const { EMPRESA_TABLE } = require('./empresaModel');

const SUCURSAL_TABLE = 'sucursal';

const SucursalSchema = {
  id_sucursal: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  clave: {
    allowNull: true,
    type: DataTypes.STRING,
    unique: true,
  },  
  nombre_sucursal: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  email_sucursal: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  telefono_sucursal: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  codigo_postal_sucursal: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  calle_sucursal: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  numero_exterior_sucursal: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  numero_interior_sucursal: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  colonia_sucursal: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  ciudad_sucursal: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  municipio_sucursal: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  estado_sucursal: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  pais_sucursal: {
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

class Sucursal extends Model {
  static associate(models) {
    this.belongsTo(models.Empresa, {
      as: 'empresa',
      foreignKey: 'id_empresa',
    });
    this.hasMany(models.Facturacion, {
      as: 'facturas',
      foreignKey: 'id_sucursal',
    });
    this.hasMany(models.Usuario, {
      as: 'usuarios',
      foreignKey: 'id_sucursal', 
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: SUCURSAL_TABLE,
      modelName: 'Sucursal',
      timestamps: false,
    };
  }
}

module.exports = { SUCURSAL_TABLE, SucursalSchema, Sucursal };
