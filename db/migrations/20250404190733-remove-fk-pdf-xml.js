'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeConstraint(
      'facturasPDF',
      'facturasPDF_id_factura_fkey'
    );
    await queryInterface.removeConstraint(
      'facturasXML',
      'facturasXML_id_factura_fkey'
    );
  },

  async down(queryInterface, Sequelize) {
    // Si quisieras restaurarlas (normalmente no lo haces si estás migrando la lógica)
  },
};
