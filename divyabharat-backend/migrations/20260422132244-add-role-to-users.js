'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'users',
        'role',
        {
          type: Sequelize.ENUM('user', 'admin'),
          allowNull: false,
          defaultValue: 'user',
        },
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('users', 'role', { transaction });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_users_role";',
        { transaction }
      );
    });
  },
};