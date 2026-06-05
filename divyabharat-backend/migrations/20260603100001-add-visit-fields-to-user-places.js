'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('user_places', 'visit_date', {
        type: Sequelize.DATEONLY,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('user_places', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('user_places', 'visit_date', { transaction });
      await queryInterface.removeColumn('user_places', 'notes', { transaction });
    });
  }
};
