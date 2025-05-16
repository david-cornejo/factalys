const { models } = require('../libs/sequelize');

class empresaServicios {
  constructor() {
    this.empresa = [];
  }

  async crear(data) {
    const newEmpresa = await models.Empresa.create(data);
    return newEmpresa;
  }

  async buscar() {
    const rta = await models.Empresa.findAll();
    return rta;
  }
 
  async buscarUno(id) {
    const empresa = await models.Empresa.findByPk(id, {
      include: ['sucursal'],
    });
    if (!empresa) {
      console.log('El usuario no existe');
    }
    return empresa;
  }

  async actualizar(id, cambios) {
    const empresa = await this.buscarUno(id);
    const rta = await empresa.update(cambios);
    return rta;
  }

  async borrar(id) {
    const empresa = await models.Empresa.findByPk(id);
    await empresa.destroy();
    return { id };
  }
}
module.exports = empresaServicios;
