require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { models, sequelize } = require('../libs/sequelize');

async function migrarREP() {
  try {
    const repFacturas = await models.Facturacion.findAll({
      where: { estadoDePago: 'REP' },
    });

    for (const factura of repFacturas) {
      await models.Rep.create({
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
      });
    }

    console.log(`✅ Se migraron ${repFacturas.length} REP correctamente.`);
  } catch (error) {
    console.error('❌ Error al migrar REP:', error);
  }
}

async function relacionarREPConFacturas() {
  try {
    const jsonPath = path.join(__dirname, 'relacion_rep_facturas.json');
    const relaciones = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    for (const rep of relaciones) {
      const repEncontrado = await models.Rep.findByPk(rep.id_rep);
      if (!repEncontrado) {
        console.warn(`⚠️ No se encontró REP con ID ${rep.id_rep}`);
        continue;
      }

      await repEncontrado.addFacturas(rep.facturas); // array de ids
    }

    console.log('✅ Relaciones entre REP y facturas creadas correctamente.');
  } catch (error) {
    console.error('❌ Error al relacionar REP con facturas:', error);
  }
}

async function eliminarREP() {
  try {
    await sequelize.query(`DELETE FROM facturacion WHERE "estadoDePago" = 'REP'`);
    console.log('✅ Se eliminaron los REP de la tabla facturacion.');
  } catch (error) {
    console.error('❌ Error al eliminar REP:', error);
  }
}

async function main() {
  await migrarREP();
  await relacionarREPConFacturas();
  await eliminarREP();
  await sequelize.close();
}

main();