const { Model, DataTypes } = require('sequelize');

const FACTURACION_MENSUAL_TABLE = 'facturacion_mensual';

const FacturacionMensualSchema = {
  id_facturacion_mensual: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  anio: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  mes: {
    allowNull: false,
    type: DataTypes.INTEGER, 
  },
  total_facturado: {
    allowNull: false,
    type: DataTypes.DECIMAL(10, 2), 
  },
  sucursal: {
    allowNull: false,
    type: DataTypes.STRING, 
  }
};

class FacturacionMensual extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: FACTURACION_MENSUAL_TABLE,
      modelName: 'FacturacionMensual',
      timestamps: false, 
    };
  }
}

module.exports = { FACTURACION_MENSUAL_TABLE, FacturacionMensualSchema, FacturacionMensual };
