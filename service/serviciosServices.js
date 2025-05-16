const { models } = require('../libs/sequelize');

class serviciosServicios {
  constructor() {
    this.servicios = [];
  }

  async crear(data) {
    const newServicios = await models.Servicios.create(data);
    return newServicios;
  }

  async buscar() {
    const rta = await models.Servicios.findAll({
      order: [['nombre_servicio', 'ASC']],
    });
    return rta;
  }

  async buscarUno(id) {
    const servicios = await models.Servicios.findByPk(id);
    if (!servicios) {
      console.log('El usuario no existe');
    }
    return servicios;
  }

  async actualizar(id, cambios) {
    const servicios = await this.buscarUno(id);
    const rta = await servicios.update(cambios);
    return rta;
  }

  async borrar(id) {
    const servicios = await models.Servicios.findByPk(id);
    await servicios.destroy();
    return { id };
  }
}
module.exports = serviciosServicios;
