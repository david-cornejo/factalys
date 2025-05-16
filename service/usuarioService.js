const { models } = require('../libs/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { config } = require('./../config/config');
const boom = require('@hapi/boom');

class usuarioServicios {
  constructor() {
    this.usuario = [];
  }

  async crear(data) {
    const hash = await bcrypt.hash(data.password_usuario, 10);
    const newUsuario = await models.Usuario.create({
      ...data,
      password_usuario: hash,
    });
    delete newUsuario.dataValues.password_usuario;
    return newUsuario;
  }

  async buscar() {
    const rta = await models.Usuario.findAll({
      include: ['sucursal'],
    });
    return rta;
  }

  async buscarEmail(email_usuario) {
    const rta = await models.Usuario.findOne({
      where: { email_usuario },
      include: ['sucursal'],
    });
    return rta;
  }

  async buscarUno(id) {
    const usuario = await models.Usuario.findByPk(id, {
      include: ['sucursal'],
    });
    if (!usuario) {
      console.log('El usuario no existe');
    }
    return usuario;
  }

  async actualizar(token, cambios) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const usuario = await this.buscarUno(payload.sub);
      const rta = await usuario.update(cambios);
      return rta;
    } catch (error) {
      throw boom.unauthorized();
    }
  }

  async actualizarSucursal(id, cambios) {
    const usuario = await this.buscarUno(id);
    const rta = await usuario.update(cambios);
    return rta;
  }

  async borrar(id) {
    const usuario = await models.Usuario.findByPk(id);
    await usuario.destroy();
    return { id };
  }
}
module.exports = usuarioServicios;
