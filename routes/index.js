const empresaRouter = require('./empresaRouter');
const clientesRouter = require('./clientesRouter');
const sucursalRouter = require('./sucursalRouter');
const usuarioRouter = require('./usuarioRouter');
const serviciosRouter = require('./serviciosRouter');
const productoRouter = require('./productoRouter');
const authRouter = require('./authRouter');
const profileRouter = require('./profileRouter');
const facturacionRouter = require('./facturacionRouter');
const domicilioFiscalRouter = require('./domicilioFiscalRouter');
const facturacionDBrouter = require('./facturacionDBrouter');
const supportRouter = require('../routes/supportRouter');
const asesorRouter = require('../routes/asesorRouter');

function routerApi(app) {
  app.use('/empresa', empresaRouter);
  app.use('/clientes', clientesRouter);
  app.use('/sucursales', sucursalRouter);
  app.use('/usuario', usuarioRouter);
  app.use('/servicios', serviciosRouter);
  app.use('/producto', productoRouter);
  app.use('/auth', authRouter);
  app.use('/profile', profileRouter);
  app.use('/facturacion', facturacionRouter);
  app.use('/facturacionDB', facturacionDBrouter);
  app.use('/domicilioFiscal', domicilioFiscalRouter);
  app.use('/support', supportRouter);
  app.use('/asesor', asesorRouter);
}

module.exports = routerApi;
