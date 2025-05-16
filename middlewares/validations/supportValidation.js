module.exports = {
  name: {
    in: ['body'],
    isString: true,
    notEmpty: true,
    errorMessage: 'El nombre es obligatorio',
  },
  email: {
    in: ['body'],
    isEmail: true,
    notEmpty: true,
    errorMessage: 'Correo electrónico no válido',
  },
  message: {
    in: ['body'],
    isString: true,
    notEmpty: true,
    errorMessage: 'El mensaje es obligatorio',
  },
};
