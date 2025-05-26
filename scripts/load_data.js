'use strict';

// scripts/load_monto_real.js
// Este script lee el CSV de ventas diarias, agrega por mes
// y actualiza/inserta la columna monto_real en Predicciones.

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { models, sequelize } = require('../libs/sequelize');

(async () => {
  try {
    // 1) Conectar a la base de datos
    await sequelize.authenticate();
    console.log('🔌 Conexión a BD establecida.');

    // 2) Leer CSV y agregar ventas diarias a nivel mensual
    const filePath = path.resolve(__dirname, '../assets/ventas_mensuales.csv');
    const monthlyData = {};

    fs.createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', row => {
        const fecha = new Date(row.Fecha);
        if (isNaN(fecha)) return;
        const anio = fecha.getFullYear();
        const mes = fecha.getMonth() + 1;
        const key = `${anio}-${String(mes).padStart(2, '0')}`;
        const monto = parseFloat(row.Cargos) || 0;

        if (!monthlyData[key]) monthlyData[key] = { anio, mes, suma: 0 };
        monthlyData[key].suma += monto;
      })
      .on('end', async () => {
        const ahora = new Date();
        const registros = Object.values(monthlyData).map(item => ({
          anio: item.anio,
          mes: item.mes,
          monto_predicho: null,         
          monto_real: item.suma,
          desviacion: null,             
          fecha_actualizacion: ahora,
          id_empresa: 1,
          createdAt: ahora,
          updatedAt: ahora
        }));

        console.log(`🗓️ Meses a procesar: ${registros.length}`);

        // 3) Bulk upsert (insert o update) en Predicciones
        await models.Prediccion.bulkCreate(registros, {
          updateOnDuplicate: [
            'monto_real',
            'fecha_actualizacion',
            'updatedAt'
          ]
        });

        console.log('✅ monto_real actualizado/inserto en Predicciones.');
        await sequelize.close();
        console.log('🔒 Conexión cerrada.');
        process.exit(0);
      });

  } catch (error) {
    console.error('❌ Error cargando monto_real:', error);
    await sequelize.close();
    process.exit(1);
  }
})();