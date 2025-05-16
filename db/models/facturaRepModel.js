const { DataTypes, Model } = require('sequelize');

const FACTURA_REP_TABLE = 'factura_rep';

const FacturaRepSchema = {
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
  id_rep: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
    references: {
      model: 'rep',
      key: 'id_facturacion',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
};

class FacturaRep extends Model {

  static config(sequelize) {
    return {
      sequelize,
      tableName: FACTURA_REP_TABLE,
      modelName: 'FacturaRep',
      timestamps: false,
    };
  }
}

module.exports = {
  FACTURA_REP_TABLE,
  FacturaRepSchema,
  FacturaRep,
};
