const { checkSchema } = require('express-validator');
const { models } = require('../../libs/sequelize');

// Validaciones para crear una sucursal
const createSucursalSchema = {
  nombre_sucursal: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El nombre de la sucursal es obligatorio',
    },
    custom: {
      options: async (value) => {
        const sucursal = await models.Sucursal.findOne({
          where: { nombre_sucursal: value },
        });
        if (sucursal) {
          throw new Error('El nombre de la sucursal ya está registrado');
        }
        return true;
      },
    },
  },
  email_sucursal: {
    in: ['body'],
    isEmail: true,
    notEmpty: {
      errorMessage: 'El email de la sucursal es obligatorio',
    },
    custom: {
      options: async (value) => {
        const sucursal = await models.Sucursal.findOne({
          where: { email_sucursal: value },
        });
        if (sucursal) {
          throw new Error('El email de la sucursal ya está registrado');
        }
        return true;
      },
    },
  },
  telefono_sucursal: {
    in: ['body'],
    isString: true,
    isLength: {
      options: { min: 10, max: 10 },
      errorMessage: 'El teléfono debe tener 10 dígitos',
    },
    notEmpty: {
      errorMessage: 'El teléfono de la sucursal es obligatorio',
    },
    custom: {
      options: async (value) => {
        const sucursal = await models.Sucursal.findOne({
          where: { telefono_sucursal: value },
        });
        if (sucursal) {
          throw new Error('El teléfono de la sucursal ya está registrado');
        }
        return true;
      },
    },
  },
  codigo_postal_sucursal: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El código postal es obligatorio',
    },
  },
  calle_sucursal: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'La calle es obligatoria',
    },
  },
  numero_exterior_sucursal: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El número exterior es obligatorio',
    },
  },
  numero_interior_sucursal: {
    in: ['body'],
    isString: true,
    optional: true,
  },
  colonia_sucursal: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'La colonia es obligatoria',
    },
  },
  ciudad_sucursal: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'La ciudad es obligatoria',
    },
  },
  municipio_sucursal: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El municipio es obligatorio',
    },
  },
  estado_sucursal: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El estado es obligatorio',
    },
  },
  pais_sucursal: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El país es obligatorio',
    },
  },
  id_empresa: {
    in: ['body'],
    isInt: true,
    notEmpty: {
      errorMessage: 'El ID de la empresa es obligatorio',
    },
    toInt: true,
  },
};

// Validaciones para actualizar una sucursal
const updateSucursalSchema = {
  id: {
    in: ['params'],
    isInt: true,
    toInt: true,
    notEmpty: {
      errorMessage: 'El ID de la sucursal es obligatorio',
    },
    custom: {
      options: async (id) => {
        const sucursal = await models.Sucursal.findByPk(id);
        if (!sucursal) {
          throw new Error('La sucursal con el ID proporcionado no existe');
        }
        return true;
      },
    },
  },
  nombre_sucursal: {
    in: ['body'],
    isString: true,
    optional: true,
    custom: {
      options: async (value, { req }) => {
        const sucursal = await models.Sucursal.findOne({
          where: { nombre_sucursal: value },
        });
        if (sucursal && sucursal.id_sucursal !== parseInt(req.params.id, 10)) {
          throw new Error('El nombre de la sucursal ya está registrado');
        }
        return true;
      },
    },
  },
};

module.exports = {
  createSucursalSchema,
  updateSucursalSchema,
};
