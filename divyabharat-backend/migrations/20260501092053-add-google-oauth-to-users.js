'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('users', 'google_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      }, { transaction });

      await queryInterface.changeColumn('users', 'password', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('users', 'google_id', { transaction });

      await queryInterface.changeColumn('users', 'password', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction });
    });
  }
};
