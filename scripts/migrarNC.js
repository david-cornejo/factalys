
const { models, sequelize } = require('../libs/sequelize');
const relaciones = require('../relaciones_nc_rep.json');

async function migrarNC() {
  try {
    const notas = await models.Facturacion.findAll({
      where: { estadoDePago: 'NC' },
    });

    for (const factura of notas) {
      const data = factura.toJSON();
      await models.NotaCredito.create(data);
    }

    console.log(`âœ… Se migraron ${notas.length} Notas de CrÃ©dito correctamente.`);
  } catch (error) {
    console.error('âŒ Error al migrar Notas de CrÃ©dito:', error);
  }
}

async function relacionarNC() {
  try {
    for (const nc of relaciones.notas_credito) {
      const nota = await models.NotaCredito.findByPk(nc.id_nota_credito);
      if (nota) {
        await nota.addFacturas(nc.facturas_origen);
        console.log(`ðŸ§© NC relacionada: ${nc.id_nota_credito}`);
      }
    }
  } catch (error) {
    console.error('âŒ Error al relacionar NC:', error);
  }
}

async function eliminarNC() {
  try {
    await models.Facturacion.destroy({
      where: { estadoDePago: 'NC' },
    });
    console.log('âœ… Se eliminaron las Notas de CrÃ©dito de facturaciÃ³n.');
  } catch (error) {
    console.error('âŒ Error al eliminar NC:', error);
  } finally {
    await sequelize.close();
  }
}

async function main() {
  await migrarNC();
  //await relacionarNC();
  // await eliminarNC(); // ðŸ”´ Activa esto solo si confirmas que todo estÃ¡ correcto
}

main();