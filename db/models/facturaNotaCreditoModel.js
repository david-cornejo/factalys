const { DataTypes, Model } = require('sequelize');

const FACTURA_NOTA_CREDITO_TABLE = 'factura_nota_credito';

const FacturaNotaCreditoSchema = {
  id_factura: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
    references: {
      model: 'facturacion',
      key: 'id_facturacion',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  id_nota_credito: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
    references: {
      model: 'nota_credito',
      key: 'id_facturacion',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
};

class FacturaNotaCredito extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: FACTURA_NOTA_CREDITO_TABLE,
      modelName: 'FacturaNotaCredito',
      timestamps: false,
    };
  }
}

module.exports = {
  FACTURA_NOTA_CREDITO_TABLE,
  FacturaNotaCreditoSchema,
  FacturaNotaCredito,
};
