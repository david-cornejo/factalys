const { checkSchema } = require('express-validator');
const { models } = require('../../libs/sequelize');

// Validaciones para crear un servicio
const createServicioSchema = {
  nombre_servicio: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El nombre del servicio es obligatorio',
    },
    custom: {
      options: async (value) => {
        const servicio = await models.Servicios.findOne({
          where: { nombre_servicio: value },
        });
        if (servicio) {
          throw new Error('El nombre del servicio ya está registrado');
        }
        return true;
      },
    },
  },
  precio_servicio: {
    in: ['body'],
    isFloat: {
      options: { min: 0 },
      errorMessage: 'El precio debe ser un número positivo',
    },
    notEmpty: {
      errorMessage: 'El precio del servicio es obligatorio',
    },
  },
  familia_servicio: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'La familia del servicio es obligatoria',
    },
  },
  id_sat_servicio: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El código SAT del servicio es obligatorio',
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

// Validaciones para actualizar un servicio
const updateServicioSchema = {
  id: {
    in: ['params'],
    isInt: true,
    toInt: true,
    notEmpty: {
      errorMessage: 'El ID del servicio es obligatorio',
    },
    custom: {
      options: async (id) => {
        const servicio = await models.Servicios.findByPk(id);
        if (!servicio) {
          throw new Error('El servicio con el ID proporcionado no existe');
        }
        return true;
      },
    },
  },
  nombre_servicio: {
    in: ['body'],
    isString: true,
    optional: true,
    custom: {
      options: async (value, { req }) => {
        const servicio = await models.Servicios.findOne({
          where: { nombre_servicio: value },
        });
        if (servicio && servicio.id_servicio !== parseInt(req.params.id, 10)) {
          throw new Error(
            'El nombre del servicio ya está registrado por otro servicio'
          );
        }
        return true;
      },
    },
  },
  precio_servicio: {
    in: ['body'],
    isFloat: {
      options: { min: 0 },
      errorMessage: 'El precio debe ser un número positivo',
    },
    optional: true,
  },
  familia_servicio: {
    in: ['body'],
    isString: true,
    optional: true,
  },
  id_sat_servicio: {
    in: ['body'],
    isString: true,
    optional: true,
  },
  id_empresa: {
    in: ['body'],
    isInt: true,
    optional: true,
    toInt: true,
  },
};

//validaciones para eliminar un servicio
const deleteServicioSchema = {
  id: {
    in: ['params'],
    isInt: true,
    toInt: true,
    notEmpty: {
      errorMessage: 'El ID del servicio es obligatorio',
    },
    custom: {
      options: async (id) => {
        const servicio = await models.Servicios.findByPk(id);
        if (!servicio) {
          throw new Error('El servicio con el ID proporcionado no existe');
        }
        return true;
      },
    },
  },
};

module.exports = {
  deleteServicioSchema,
  createServicioSchema,
  updateServicioSchema,
};
