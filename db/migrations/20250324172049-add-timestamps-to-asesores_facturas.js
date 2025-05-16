'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('asesores_facturas', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    });

    await queryInterface.addColumn('asesores_facturas', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('asesores_facturas', 'createdAt');
    await queryInterface.removeColumn('asesores_facturas', 'updatedAt');
  },
};
