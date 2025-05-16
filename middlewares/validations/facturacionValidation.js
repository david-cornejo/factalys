const { checkSchema } = require('express-validator');
const { models } = require('../../libs/sequelize');
const { optional } = require('joi');

// Validación dinámica según el tipo de factura
const createFacturacionSchema = {
  'facturapi.type': {
    in: ['body'],
    isString: true,
    optional: true,
    isIn: {
      options: [['I', 'E', 'P']],
      errorMessage: 'El tipo de factura debe ser I, E o P',
    },
  },

  // Validaciones generales para todas las facturas
  'facturapi.customer': {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El ID del cliente en facturapi es obligatorio',
    },
    isLength: {
      options: { min: 24, max: 24 },
      errorMessage: 'El ID del cliente debe tener 24 caracteres',
    },
    matches: {
      options: /^[0-9a-fA-F]{24}$/,
      errorMessage:
        'El ID del cliente debe contener solo caracteres hexadecimales',
    },
  },
  
  // Validaciones específicas para Facturas de **Ingreso (I)**
  'facturapi.items': {
    in: ['body'],
    optional: {
      options: ({ req }) => req.body.facturapi.type !== 'I',
    },
    isArray: {
      errorMessage: 'Debe proporcionar al menos un ítem en la factura',
    },
    notEmpty: {
      errorMessage: 'Debe proporcionar al menos un ítem en la factura',
    },
  },
  'facturapi.use': {
    in: ['body'],
    optional: {
      options: ({ req }) => req.body.facturapi.type !== 'I',
    },
    isString: true,
    notEmpty: {
      errorMessage: 'El uso del CFDI es obligatorio para facturas de ingreso',
    },
  },
  'facturapi.payment_form': {
    in: ['body'],
    optional: {
      options: ({ req }) => req.body.facturapi.type !== 'I',
    },
    isString: true,
    notEmpty: {
      errorMessage: 'El método de pago es obligatorio',
    },
  },

  // Validaciones específicas para **Notas de Crédito (E)**
  'facturapi.related_documents': {
    in: ['body'],
    optional: {
      options: ({ req }) => req.body.facturapi.type !== 'E',
    },
    isArray: {
      errorMessage: 'Debe proporcionar al menos un documento relacionado',
    },
    notEmpty: {
      errorMessage: 'Debe proporcionar al menos un documento relacionado',
    },
  },

  // Validaciones específicas para **Complementos de Pago (P)**
  'facturapi.complements': {
    in: ['body'],
    optional: {
      options: ({ req }) => req.body.facturapi.type !== 'P',
    },
    isArray: {
      errorMessage: 'Debe proporcionar al menos un complemento de pago',
    },
    notEmpty: {
      errorMessage: 'Debe proporcionar al menos un complemento de pago',
    },
  },

  // Validaciones generales para todas las facturas
  'otros.estado': {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El estado de la factura es obligatorio',
    },
    isIn: {
      options: [['SP', 'VP', 'SN', 'VN', 'NC', 'REP']],
      errorMessage: 'Estado inválido, debe ser SP, VP, SN, VN, REP o NC',
    },
  },
  'otros.serieSucursal': {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'La serie de la sucursal es obligatoria',
    },
  },
  'otros.id_sucursal': {
    in: ['body'],
    isInt: true,
    notEmpty: {
      errorMessage: 'El ID de la sucursal es obligatorio',
    },
    toInt: true,
  },
};

// Validaciones para filtrar facturas
const filterFacturacionSchema = {
  customer: {
    in: ['query'],
    isString: true,
    isLength: {
      options: { min: 24, max: 24 },
      errorMessage: 'El ID del cliente debe tener 24 caracteres',
    },
    matches: {
      options: /^[0-9a-fA-F]{24}$/,
      errorMessage:
        'El ID del cliente debe contener solo caracteres hexadecimales',
    },
    optional: true,
  },
  types: {
    in: ['query'],
    isString: true,
    optional: true,
  },
  gte: {
    in: ['query'],
    isISO8601: true,
    optional: true,
    errorMessage: 'La fecha mínima debe ser en formato YYYY-MM-DD',
  },
  lte: {
    in: ['query'],
    isISO8601: true,
    optional: true,
    errorMessage: 'La fecha máxima debe ser en formato YYYY-MM-DD',
  },
};

// Validaciones para actualizar el estado de una factura
const updateStatusFacturacionSchema = {
  id: {
    in: ['params'],
    isString: true,
    notEmpty: {
      errorMessage: 'El ID de la factura es obligatorio',
    },
    isLength: {
      options: { min: 24, max: 24 },
      errorMessage: 'El ID del cliente debe tener 24 caracteres',
    },
    matches: {
      options: /^[0-9a-fA-F]{24}$/,
      errorMessage:
        'El ID del cliente debe contener solo caracteres hexadecimales',
    },
  },
};

// Validaciones para cancelar una factura
const cancelFacturacionSchema = {
  id: {
    in: ['params'],
    isString: true,
    notEmpty: {
      errorMessage: 'El ID de la factura es obligatorio',
    },
    isLength: {
      options: { min: 24, max: 24 },
      errorMessage: 'El ID del cliente debe tener 24 caracteres',
    },
    matches: {
      options: /^[0-9a-fA-F]{24}$/,
      errorMessage:
        'El ID del cliente debe contener solo caracteres hexadecimales',
    },
  },
  motive: {
    in: ['query'],
    isString: true,
    notEmpty: {
      errorMessage: 'El motivo de la cancelación es obligatorio',
    },
  },
};

module.exports = {
  createFacturacionSchema,
  filterFacturacionSchema,
  updateStatusFacturacionSchema,
  cancelFacturacionSchema,
};
