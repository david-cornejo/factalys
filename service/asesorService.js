const { models } = require('../libs/sequelize');

class asesorService {
  async crear(data) {
    const nuevoAsesor = await models.Asesor.create(data);
    return nuevoAsesor;
  }

  async buscarTodos() {
    return await models.Asesor.findAll({ order: [['nombre', 'ASC']] });
  }

  async buscarUno(id) {
    const asesor = await models.Asesor.findByPk(id);
    if (!asesor) {
      throw new Error('Asesor no encontrado');
    }
    return asesor;
  }

  async actualizar(id, cambios) {
    const asesor = await this.buscarUno(id);
    return await asesor.update(cambios);
  }

  async eliminar(id) {
    const asesor = await this.buscarUno(id);
    await asesor.destroy();
    return { id };
  }

  async obtenerFacturasPorAsesor(idAsesor) {
    const asesor = await models.Asesor.findByPk(idAsesor, {
      include: [
        {
          model: models.Facturacion,
          as: 'facturas',
        },
      ],
    });

    if (!asesor) {
      throw new Error('Asesor no encontrado');
    }

    return asesor.facturas;
  }
}

module.exports = asesorService;
