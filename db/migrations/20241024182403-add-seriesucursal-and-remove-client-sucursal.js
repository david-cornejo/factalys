'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar la columna serieSucursal a la tabla facturacion
    await queryInterface.addColumn('facturacion', 'serieSucursal', {
      allowNull: true,
      type: Sequelize.STRING,
    });

    // Eliminar la columna id_sucursal de la tabla clientes
    await queryInterface.removeColumn('clientes', 'id_sucursal');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar la columna serieSucursal de la tabla facturacion
    await queryInterface.removeColumn('facturacion', 'serieSucursal');

    // Agregar de nuevo la columna id_sucursal en la tabla clientes
    await queryInterface.addColumn('clientes', 'id_sucursal', {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'sucursal', // Asegúrate de que el nombre de la tabla esté correcto
        key: 'id_sucursal',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
};
