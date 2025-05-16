const { Model, DataTypes } = require('sequelize');
const { CLIENTES_TABLE } = require('./clientesModel');
const { SUCURSAL_TABLE } = require('./sucursalModel');
const { allow } = require('joi');

const FACTURACION_TABLE = 'facturacion';

const FacturacionSchema = {
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
    // 🔹 Nuevo campo
    allowNull: true,
    type: DataTypes.BOOLEAN,
    defaultValue: false, // 🔹 Por defecto será `false`
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
  id_usuario_creador: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id_usuario',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  estado: {
    allowNull: true,
    type: DataTypes.STRING,
    defaultValue: 'valida', // por defecto todas serán válidas
  },
};

class Facturacion extends Model {
  static associate(models) {
    this.belongsTo(models.Clientes, {
      as: 'clientes',
      foreignKey: 'id_cliente',
    });

    this.belongsTo(models.Sucursal, {
      as: 'sucursal',
      foreignKey: 'id_sucursal',
    });

    this.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: 'id_usuario_creador',
    });

    this.belongsToMany(models.Asesor, {
      through: 'asesores_facturas',
      as: 'asesores',
      foreignKey: 'id_factura',
      otherKey: 'id_asesor',
    });

    this.hasOne(models.PDF, {
      as: 'pdf',
      foreignKey: 'id_factura',
    });

    this.hasOne(models.XML, {
      as: 'xml',
      foreignKey: 'id_factura',
    });

    // 🔹 Relación muchos a muchos con REP
    this.belongsToMany(models.Rep, {
      through: 'factura_rep',
      as: 'reps',
      foreignKey: 'id_factura',
      otherKey: 'id_rep',
      timestamps: false,
    });

    // 🔹 Relación muchos a muchos con Nota de Crédito
    this.belongsToMany(models.NotaCredito, {
      through: 'factura_nota_credito',
      as: 'notasCredito',
      foreignKey: 'id_factura',
      otherKey: 'id_nota_credito',
      timestamps: false,
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: FACTURACION_TABLE,
      modelName: 'Facturacion',
      timestamps: false,
    };
  }
}


module.exports = { FACTURACION_TABLE, FacturacionSchema, Facturacion };
