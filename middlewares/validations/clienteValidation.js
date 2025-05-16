const { checkSchema } = require('express-validator');

// Validaciones para crear un cliente
const createClienteSchema = {
  nombre_cliente: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El nombre del cliente es obligatorio',
    },
  },
  email_cliente: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Debe proporcionar un correo electrónico válido',
    },
  },
  rfc_cliente: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El RFC del cliente es obligatorio',
    },
  },
  tax_system_cliente: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El régimen fiscal (tax system) es obligatorio',
    },
  },
  telefono_cliente: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El teléfono del cliente es obligatorio',
    },
  },
};

// Validaciones para actualizar un cliente
const updateClienteSchema = {
  nombre_cliente: {
    in: ['body'],
    isString: true,
    optional: true,
  },
  email_cliente: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Debe proporcionar un correo electrónico válido',
    },
    optional: true,
  },
  rfc_cliente: {
    in: ['body'],
    isString: true,
    optional: true,
  },
  tax_system_cliente: {
    in: ['body'],
    isString: true,
    optional: true,
  },
  telefono_cliente: {
    in: ['body'],
    isString: true,
    optional: true,
  },
};

module.exports = {
  createClienteSchema,
  updateClienteSchema,
};