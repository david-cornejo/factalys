const { checkSchema } = require('express-validator');
const { models } = require('../../libs/sequelize');

// Validaciones para crear una empresa
const createEmpresaSchema = {
  nombre_empresa: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El nombre de la empresa es obligatorio',
    },
    custom: {
      options: async (value) => {
        const empresa = await models.Empresa.findOne({
          where: { nombre_empresa: value },
        });
        if (empresa) {
          throw new Error('El nombre de la empresa ya está registrado');
        }
        return true;
      },
    },
  },
  domicilio_fiscal_empresa: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'El domicilio fiscal de la empresa es obligatorio',
    },
  },
};

// Validaciones para actualizar una empresa
const updateEmpresaSchema = {
  nombre_empresa: {
    in: ['body'],
    isString: true,
    optional: true,
    custom: {
      options: async (value, { req }) => {
        const empresa = await models.Empresa.findOne({
          where: { nombre_empresa: value },
        });
        if (empresa && empresa.id_empresa !== parseInt(req.params.id, 10)) {
          throw new Error(
            'El nombre de la empresa ya está registrado por otra empresa'
          );
        }
        return true;
      },
    },
  },
  domicilio_fiscal_empresa: {
    in: ['body'],
    isString: true,
    optional: true,
  },
};

module.exports = {
  createEmpresaSchema,
  updateEmpresaSchema,
};
