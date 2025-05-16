'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('facturacion', 'id_usuario_creador', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('facturacion', 'id_usuario_creador');
  },
};
