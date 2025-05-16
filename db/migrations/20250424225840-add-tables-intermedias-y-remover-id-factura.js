'use strict';

const { DataTypes } = require('sequelize');

const FACTURA_REP_TABLE = 'factura_rep';
const FACTURA_NOTA_CREDITO_TABLE = 'factura_nota_credito';
const REP_TABLE = 'rep';
const NOTA_CREDITO_TABLE = 'nota_credito';

module.exports = {
  async up(queryInterface) {
    // 1. Crear tabla intermedia factura_rep
    await queryInterface.createTable(FACTURA_REP_TABLE, {
      id_factura: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      id_rep: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
    });

    // 2. Crear tabla intermedia factura_nota_credito
    await queryInterface.createTable(FACTURA_NOTA_CREDITO_TABLE, {
      id_factura: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      id_nota_credito: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
    });

    // 3. Quitar columna id_factura de tabla rep
    await queryInterface.removeColumn(REP_TABLE, 'id_factura');

    // 4. Quitar columna id_factura de tabla nota_credito
    await queryInterface.removeColumn(NOTA_CREDITO_TABLE, 'id_factura');
  },

  async down(queryInterface) {
    // Rollback

    // 1. Volver a agregar columna id_factura a rep
    await queryInterface.addColumn(REP_TABLE, 'id_factura', {
      type: DataTypes.STRING,
      allowNull: false,
    });

    // 2. Volver a agregar columna id_factura a nota_credito
    await queryInterface.addColumn(NOTA_CREDITO_TABLE, 'id_factura', {
      type: DataTypes.STRING,
      allowNull: false,
    });

    // 3. Eliminar tabla intermedia factura_rep
    await queryInterface.dropTable(FACTURA_REP_TABLE);

    // 4. Eliminar tabla intermedia factura_nota_credito
    await queryInterface.dropTable(FACTURA_NOTA_CREDITO_TABLE);
  },
};
