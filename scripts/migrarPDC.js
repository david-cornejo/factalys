require('dotenv').config();
const { sequelize, models } = require('../libs/sequelize');
const { Op } = require('sequelize');

async function migrarPDC() {
  try {
    const facturasPDC = await models.Facturacion.findAll({
      where: {
        estadoDePago: 'PDC',
      },
    });

    for (const factura of facturasPDC) {
      const idFacturaPadre = factura.id_facturacion.replace(/^PDC/, '');

      await models.Pago.create({
        id_facturacion: factura.id_facturacion,
        fecha_emision: factura.fecha_emision,
        total: factura.total,
        tipo_factura: factura.tipo_factura,
        estadoDePago: factura.estadoDePago,
        folio: factura.folio,
        serieSucursal: factura.serieSucursal,
        contrato: factura.contrato,
        atendida: factura.atendida,
        fecha_inicio: factura.fecha_inicio,
        fecha_fin: factura.fecha_fin,
        id_cliente: factura.id_cliente,
        id_usuario_creador: factura.id_usuario_creador,
        id_sucursal: factura.id_sucursal,
        estado: factura.estado,
        id_factura: idFacturaPadre,
      });
    }

    console.log(`✅ Se migraron ${facturasPDC.length} PDCs correctamente.`);
  } catch (error) {
    console.error('❌ Error al migrar PDCs:', error);
  }
}

async function eliminarPDC() {
  try {
    // Validamos que todos los pagos PDC tienen padre válido
    const pagosSinPadre = await models.Pago.findAll({
      where: { id_factura: { [Op.is]: null } },
    });

    if (pagosSinPadre.length > 0) {
      console.error('⚠️ Hay pagos sin factura padre asignada. Abortando eliminación.');
      return;
    }

    // 🔥 Reasignamos temporalmente o desactivamos la FK si es necesario
    // Pero para este caso, forzamos la eliminación solo si la relación es segura
    const [results, metadata] = await sequelize.query(`
      DELETE FROM facturacion 
      WHERE "estadoDePago" = 'PDC'
        AND id_facturacion NOT IN (
          SELECT id_factura FROM pago
        )
    `);

    console.log('✅ Se eliminaron los PDCs correctamente.');
  } catch (error) {
    console.error('❌ Error al eliminar PDCs:', error);
  } finally {
    await sequelize.close();
  }
}

async function main() {
  // Paso 1: migrar los PDC
  //await migrarPDC();

  // Paso 2: eliminar los registros originales
  await eliminarPDC();

  await sequelize.close();
}

main();