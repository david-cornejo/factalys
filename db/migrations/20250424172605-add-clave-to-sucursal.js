'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sucursal', 'clave', {
      type: Sequelize.STRING,
      allowNull: true, // o false según lo necesites
      unique: true,    // si deseas que no se repitan
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sucursal', 'clave');
  },
};
