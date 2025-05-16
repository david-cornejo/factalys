const { Model, DataTypes } = require('sequelize');
const { Facturacion } = require('./facturacion');

const FACTURASXML_TABLE = 'facturasXML';

const FacturasXMLSchema = {
  id_xml: {
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

class XML extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: FACTURASXML_TABLE,
      modelName: 'XML',
      timestamps: false,
    };
  }
}

module.exports = { FACTURASXML_TABLE, FacturasXMLSchema, XML };
