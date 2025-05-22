const { Empresa, EmpresaSchema } = require('./../models/empresaModel');
const { Clientes, ClientesSchema } = require('./../models/clientesModel');
const { Sucursal, SucursalSchema } = require('./../models/sucursalModel');
const { Usuario, UsucarioSchema } = require('./../models/usuarioModel');
const { Servicios, ServiciosSchema } = require('./../models/serviciosModel');
const { Producto, ProductoSchema } = require('./../models/productoModel');
const { Facturacion, FacturacionSchema } = require('./../models/facturacion');
const { DomicilioFiscal, DomicilioFiscalSchema } = require('./../models/domicilioFiscalModel');
const { PDF, FacturasPDFSchema } = require('./../models/facturasPDFModel');
const { XML, FacturasXMLSchema } = require('./../models/facturasXMLModel');
const { Asesor, AsesorSchema } = require('./../models/asesorModel');
const { Rep, RepSchema } = require('./../models/repModel');
const { NotaCredito, NotaCreditoSchema } = require('./../models/notaCreditoModel');
const { Pago, PagoSchema } = require('./../models/pagoModel');
const { Prediccion, PrediccionSchema } = require('./../models/prediccionesModel');

// 🆕 Tablas intermedias
const { FacturaRep, FacturaRepSchema } = require('./../models/facturaRepModel');
const { FacturaNotaCredito, FacturaNotaCreditoSchema } = require('./../models/facturaNotaCreditoModel');

function setupModels(sequelize) {
  // Inicialización de modelos
  Empresa.init(EmpresaSchema, Empresa.config(sequelize));
  Clientes.init(ClientesSchema, Clientes.config(sequelize));
  Sucursal.init(SucursalSchema, Sucursal.config(sequelize));
  Usuario.init(UsucarioSchema, Usuario.config(sequelize));
  Servicios.init(ServiciosSchema, Servicios.config(sequelize));
  Producto.init(ProductoSchema, Producto.config(sequelize));
  DomicilioFiscal.init(DomicilioFiscalSchema, DomicilioFiscal.config(sequelize));
  Facturacion.init(FacturacionSchema, Facturacion.config(sequelize));
  PDF.init(FacturasPDFSchema, PDF.config(sequelize));
  XML.init(FacturasXMLSchema, XML.config(sequelize));
  Asesor.init(AsesorSchema, Asesor.config(sequelize));
  Rep.init(RepSchema, Rep.config(sequelize));
  NotaCredito.init(NotaCreditoSchema, NotaCredito.config(sequelize));
  Pago.init(PagoSchema, Pago.config(sequelize));
  Prediccion.init(PrediccionSchema, Prediccion.config(sequelize));
  FacturaRep.init(FacturaRepSchema, FacturaRep.config(sequelize));
  FacturaNotaCredito.init(FacturaNotaCreditoSchema, FacturaNotaCredito.config(sequelize));

  // Asociaciones
  Empresa.associate(sequelize.models);
  Clientes.associate(sequelize.models);
  Sucursal.associate(sequelize.models);
  Usuario.associate(sequelize.models);
  Servicios.associate(sequelize.models);
  Producto.associate(sequelize.models);
  DomicilioFiscal.associate(sequelize.models);
  Facturacion.associate(sequelize.models);
  PDF.associate && PDF.associate(sequelize.models);
  XML.associate && XML.associate(sequelize.models);
  Asesor.associate(sequelize.models);
  Rep.associate(sequelize.models);
  NotaCredito.associate(sequelize.models);
  Pago.associate && Pago.associate(sequelize.models);
  Prediccion.associate && Prediccion.associate(sequelize.models);
  // Las tablas intermedias no necesitan associate normalmente
}

module.exports = setupModels;