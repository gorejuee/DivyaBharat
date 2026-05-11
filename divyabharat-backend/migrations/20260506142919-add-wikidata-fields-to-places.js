'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('places', 'wikidata_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      }, { transaction });

      await queryInterface.addColumn('places', 'source', {
        type: Sequelize.ENUM('wikidata', 'community'),
        allowNull: false,
        defaultValue: 'community'
      }, { transaction });
    });
  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('places', 'wikidata_id', { transaction });
      await queryInterface.removeColumn('places', 'source', { transaction });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_places_source";',
        { transaction }
      );
    });
  }
};
