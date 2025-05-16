'use strict';
const { EmpresaSchema, EMPRESA_TABLE } = require('./../models/empresaModel');
const { SucursalSchema, SUCURSAL_TABLE } = require('./../models/sucursalModel');
const { ProductoSchema, PRODUCTO_TABLE } = require('./../models/productoModel');
const {
  ServiciosSchema,
  SERVICIOS_TABLE,
} = require('./../models/serviciosModel');
const { ClientesSchema, CLIENTES_TABLE } = require('./../models/clientesModel');
const { UsucarioSchema, USUARIO_TABLE } = require('./../models/usuarioModel');
const {
  FacturacionSchema,
  FACTURACION_TABLE,
} = require('./../models/facturacion');
const {
  DomicilioFiscalSchema,
  DOMICILIO_FISCAL_TABLE,
} = require('./../models/domicilioFiscalModel');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable(EMPRESA_TABLE, EmpresaSchema);
    await queryInterface.createTable(SUCURSAL_TABLE, SucursalSchema);
    await queryInterface.createTable(PRODUCTO_TABLE, ProductoSchema);
    await queryInterface.createTable(SERVICIOS_TABLE, ServiciosSchema);
    await queryInterface.createTable(CLIENTES_TABLE, ClientesSchema);
    await queryInterface.createTable(USUARIO_TABLE, UsucarioSchema);
    await queryInterface.createTable(FACTURACION_TABLE, FacturacionSchema);
    await queryInterface.createTable(
      DOMICILIO_FISCAL_TABLE,
      DomicilioFiscalSchema
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(EMPRESA_TABLE);
    await queryInterface.dropTable(SUCURSAL_TABLE);
    await queryInterface.dropTable(PRODUCTO_TABLE);
    await queryInterface.dropTable(SERVICIOS_TABLE);
    await queryInterface.dropTable(CLIENTES_TABLE);
    await queryInterface.dropTable(USUARIO_TABLE);
    await queryInterface.dropTable(FACTURACION_TABLE);
    await queryInterface.dropTable(DOMICILIO_FISCAL_TABLE);
  },
};
