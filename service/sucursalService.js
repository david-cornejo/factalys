const { models } = require('../libs/sequelize');

class sucursalServicios {
  constructor() {
    this.sucursal = [];
  }

  async crear(data) {
    const newSucursal = await models.Sucursal.create(data);
    return newSucursal;
  }

  async crearMuchos(data) {
    const nuevasSucursales = await Promise.all(
      data.map(async (sucursal) => {
        const nuevaSucursal = await models.Sucursal.create(sucursal);
        return nuevaSucursal;
      })
    );
    return nuevasSucursales;
  }

  async buscar() {
    const rta = await models.Sucursal.findAll({
      order: [['nombre_sucursal', 'ASC']],
    });
    return rta;
  }

  async buscarPorUsuario(id_usuario) {
    const usuario = await models.Usuario.findByPk(id_usuario, {
      include: [
        {
          model: models.Sucursal,
          as: 'sucursal', // Nombre de la relación en el modelo de Usuario
        },
      ],
    });

    if (usuario) {
      return usuario.sucursal; // Devuelve la sucursal asociada al usuario
    } else {
      return null; // Manejar el caso en el que no se encuentre el usuario
    }
  }

  async buscarUno(id) {
    const sucursal = await models.Sucursal.findByPk(id, {
      include: ['usuarios'],
    });
    if (!sucursal) {
      console.log('La sucursal no existe');
    }
    return sucursal;
  }

  async actualizar(id, cambios) {
    const sucursal = await this.buscarUno(id);
    const rta = await sucursal.update(cambios);
    return rta;
  }

  async borrar(id) {
    const sucursal = await models.Sucursal.findByPk(id);
    await sucursal.destroy();
    return { id };
  }
}
module.exports = sucursalServicios;
