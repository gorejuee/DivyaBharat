'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable('trip_places', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        trip_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'trips', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        place_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'places', key: 'id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        destination_name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        destination_city: {
          type: Sequelize.STRING,
          allowNull: true
        },
        destination_state: {
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
        day_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        order: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        duration_hours: {
          type: Sequelize.DECIMAL(4, 1),
          allowNull: true
        },
        visit_date: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
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

      await queryInterface.addIndex('trip_places', ['trip_id'], {
        name: 'trip_places_trip_id_idx',
        transaction
      });

      await queryInterface.addIndex('trip_places', ['trip_id', 'day_number', 'order'], {
        name: 'trip_places_trip_day_order_idx',
        transaction
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('trip_places', { transaction });
    });
  }
};
