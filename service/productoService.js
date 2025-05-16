const { models } = require('../libs/sequelize');

class serviciosServicios {
  constructor() {
    this.producto = [];
  }

  async crear(data) {
    const newProducto = await models.Producto.create(data);
    return newProducto;
  }

  async buscar() {
    const rta = await models.Producto.findAll({
      order: [['nombre_producto', 'ASC']],
    });
    return rta;
  }

  async buscarUno(id) {
    const producto = await models.Producto.findByPk(id);
    if (!producto) {
      console.log('El usuario no existe');
    }
    return producto;
  }

  async actualizar(id, cambios) {
    const producto = await this.buscarUno(id);
    const rta = await producto.update(cambios);
    return rta;
  }

  async borrar(id) {
    const producto = await models.Producto.findByPk(id);
    await producto.destroy();
    return { id };
  }
}
module.exports = serviciosServicios;
