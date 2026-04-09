'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction( async (transaction) => {
      await queryInterface.createTable('places', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        history: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        category: {
          type: Sequelize.ENUM(
            'temple',
            'fort',
            'cave',
            'ghat',
            'ashram',
            'gurudwara',
            'sacred_river',
            'ancient_site',
            'heritage_village',
            'museum',
            'natural_sacred',
            'other'
          ),
          allowNull: false
        },
        state: {
          type: Sequelize.STRING,
          allowNull: false
        },
        city: {
          type: Sequelize.STRING,
          allowNull: true
        },
        latitude: {
          type: Sequelize.DECIMAL(10, 8),
          allowNull: true
        },
        longitude: {
          type: Sequelize.DECIMAL(11, 8),
          allowNull: true
        },
        image_url: {
          type: Sequelize.STRING,
          allowNull: true
        },
        status: {
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending'
        },
        submitted_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });
    });
  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('places', { transaction });
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_places_category";',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_places_status";',
        { transaction }
      );
    });
  }
};
