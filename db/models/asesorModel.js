const { Model, DataTypes } = require('sequelize');

const ASESOR_TABLE = 'asesores';

const AsesorSchema = {
  id_asesor: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nombre: {
    allowNull: false,
    type: DataTypes.STRING,
  },
};

class Asesor extends Model {
  static associate(models) {
    this.belongsToMany(models.Facturacion, {
      through: 'asesores_facturas',
      as: 'facturas',
      foreignKey: 'id_asesor',
      otherKey: 'id_factura',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ASESOR_TABLE,
      modelName: 'Asesor',
      timestamps: false,
    };
  }
}

module.exports = { ASESOR_TABLE, AsesorSchema, Asesor };
