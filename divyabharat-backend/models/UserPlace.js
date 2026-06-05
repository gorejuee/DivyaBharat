const { DataTypes } = require('sequelize');
const sequelize = require('@server/config/database');

const UserPlace = sequelize.define('UserPlace', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  place_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  visited_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  visit_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'user_places',
  timestamps: true,
  underscored: true
});

module.exports = UserPlace;
