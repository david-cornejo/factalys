const { Model, DataTypes, Sequelize } = require('sequelize');
const { SUCURSAL_TABLE } = require('./sucursalModel');

const USUARIO_TABLE = 'usuario';

const UsucarioSchema = {
  id_usuario: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nombre_usuario: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  puesto_usuario: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  tipo_usuario: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  email_usuario: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  password_usuario: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  rfc_usuario: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: false,
  },
  recovery_token: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  telefono_usuario: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: false,
  },
  imagen_usuario: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  id_sucursal: {
    field: 'id_sucursal',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: SUCURSAL_TABLE,
      key: 'id_sucursal',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
};

class Usuario extends Model {
  static associate(models) {
    this.belongsTo(models.Sucursal, {
      as: 'sucursal',
      foreignKey: 'id_sucursal',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: USUARIO_TABLE,
      modelName: 'Usuario',
      timestamps: false,
    };
  }
}

module.exports = { USUARIO_TABLE, UsucarioSchema, Usuario };
