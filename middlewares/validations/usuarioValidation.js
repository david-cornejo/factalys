const { checkSchema } = require('express-validator');
const { models } = require('../../libs/sequelize');

// Validaciones para crear un usuario
const createUsuarioSchema = {
  nombre_usuario: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El nombre del usuario es obligatorio',
    },
  },
  puesto_usuario: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El puesto del usuario es obligatorio',
    },
  },
  tipo_usuario: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El tipo de usuario es obligatorio',
    },
  },
  email_usuario: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Debe proporcionar un correo electrónico válido',
    },
    notEmpty: {
      errorMessage: 'El correo electrónico es obligatorio',
    },
    custom: {
      options: async (value) => {
        const usuario = await models.Usuario.findOne({ where: { email_usuario: value } });
        if (usuario) {
          throw new Error('El correo electrónico ya está registrado');
        }
        return true;
      },
    },
  },
  password_usuario: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'La contraseña es obligatoria',
    },
    isLength: {
      options: { min: 6 },
      errorMessage: 'La contraseña debe tener al menos 6 caracteres',
    },
  },
  rfc_usuario: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El RFC del usuario es obligatorio',
    },
  },
  telefono_usuario: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El teléfono del usuario es obligatorio',
    },
    matches: {
      options: [/^\d{10}$/],
      errorMessage: 'El teléfono debe tener 10 dígitos',
    },
    custom: {
      options: async (value) => {
        const usuario = await models.Usuario.findOne({ where: { telefono_usuario: value } });
        if (usuario) {
          throw new Error('El teléfono ya está registrado');
        }
        return true;
      },
    },
  },
  id_sucursal: {
    in: ['body'],
    isInt: true,
    notEmpty: {
      errorMessage: 'El ID de la sucursal es obligatorio',
    },
    toInt: true,
  },
};

// Validaciones para actualizar un usuario
const updateUsuarioSchema = {
  nombre_usuario: {
    in: ['body'],
    isString: true,
    optional: true,
  },
  puesto_usuario: {
    in: ['body'],
    isString: true,
    optional: true,
  },
  tipo_usuario: {
    in: ['body'],
    isString: true,
    optional: true,
  },
  email_usuario: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Debe proporcionar un correo electrónico válido',
    },
    optional: true,
    custom: {
      options: async (value, { req }) => {
        const usuario = await models.Usuario.findOne({ where: { email_usuario: value } });
        if (usuario && usuario.id_usuario !== parseInt(req.params.id, 10)) {
          throw new Error('El correo electrónico ya está registrado por otro usuario');
        }
        return true;
      },
    },
  },
  password_usuario: {
    in: ['body'],
    isString: true,
    isLength: {
      options: { min: 6 },
      errorMessage: 'La contraseña debe tener al menos 6 caracteres',
    },
    optional: true,
  },
  rfc_usuario: {
    in: ['body'],
    isString: true,
    optional: true,
  },
  telefono_usuario: {
    in: ['body'],
    isString: true,
    matches: {
      options: [/^\d{10}$/],
      errorMessage: 'El teléfono debe tener 10 dígitos',
    },
    optional: true,
    custom: {
      options: async (value, { req }) => {
        const usuario = await models.Usuario.findOne({ where: { telefono_usuario: value } });
        if (usuario && usuario.id_usuario !== parseInt(req.params.id, 10)) {
          throw new Error('El teléfono ya está registrado por otro usuario');
        }
        return true;
      },
    },
  },
  id_sucursal: {
    in: ['body'],
    isInt: true,
    optional: true,
    toInt: true,
  },
};

module.exports = {
  createUsuarioSchema,
  updateUsuarioSchema,
};