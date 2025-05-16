const { Model, DataTypes } = require('sequelize');
const { Facturacion } = require('./facturacion');

const FACTURASPDF_TABLE = 'facturasPDF';

const FacturasPDFSchema = {
  id_pdf: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  archivo: {
    allowNull: false,
    type: DataTypes.BLOB('long'),
  },
  id_factura: {
    allowNull: false,
    type: DataTypes.STRING,
  },
};

class PDF extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: FACTURASPDF_TABLE,
      modelName: 'PDF',
      timestamps: false,
    };
  }
}

module.exports = { FACTURASPDF_TABLE, FacturasPDFSchema, PDF };
