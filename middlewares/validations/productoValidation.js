const { checkSchema } = require('express-validator');
const { models } = require('../../libs/sequelize');

// Validaciones para crear un producto
const createProductoSchema = {
  nombre_producto: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El nombre del producto es obligatorio',
    },
    custom: {
      options: async (value) => {
        const producto = await models.Producto.findOne({
          where: { nombre_producto: value },
        });
        if (producto) {
          throw new Error('El nombre del producto ya está registrado');
        }
        return true;
      },
    },
  },
  precio_unidad_producto: {
    in: ['body'],
    isFloat: {
      options: { min: 0 },
      errorMessage: 'El precio debe ser un número positivo',
    },
    notEmpty: {
      errorMessage: 'El precio del producto es obligatorio',
    },
  },
  familia_producto: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'La familia del producto es obligatoria',
    },
  },
  id_sat_producto: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El código SAT del producto es obligatorio',
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
// Validaciones para actualizar un producto
const updateProductoSchema = {
  id: {
    in: ['params'],
    isInt: true,
    toInt: true,
    notEmpty: {
      errorMessage: 'El ID del producto es obligatorio',
    },
    custom: {
      options: async (id) => {
        const producto = await models.Producto.findByPk(id);
        if (!producto) {
          throw new Error('El producto con el ID proporcionado no existe');
        }
        return true;
      },
    },
  },
  nombre_producto: {
    in: ['body'],
    isString: true,
    optional: true,
    custom: {
      options: async (value, { req }) => {
        const producto = await models.Producto.findOne({
          where: { nombre_producto: value },
        });
        if (producto && producto.id_producto !== parseInt(req.params.id, 10)) {
          throw new Error(
            'El nombre del producto ya está registrado por otro producto'
          );
        }
        return true;
      },
    },
  },
  precio_unidad_producto: {
    in: ['body'],
    isFloat: {
      options: { min: 0 },
      errorMessage: 'El precio debe ser un número positivo',
    },
    optional: true,
  },
  familia_producto: {
    in: ['body'],
    isString: true,
    optional: true,
  },
  id_sat_producto: {
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

//validacion para eliminar un producto

const deleteProductoSchema = {
  id: {
    in: ['params'],
    isInt: true,
    toInt: true,
    notEmpty: {
      errorMessage: 'El ID del producto es obligatorio',
    },
    custom: {
      options: async (id) => {
        const producto = await models.Producto.findByPk(id);
        if (!producto) {
          throw new Error('El producto con el ID proporcionado no existe');
        }
        return true;
      },
    },
  },
};

module.exports = {
  createProductoSchema,
  updateProductoSchema,
  deleteProductoSchema,
};
