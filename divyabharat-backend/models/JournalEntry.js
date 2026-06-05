const { DataTypes } = require('sequelize');
const sequelize = require('@server/config/database');

const JournalEntry = sequelize.define('JournalEntry', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  visit_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  trip_id: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'journal_entries',
  timestamps: true,
  underscored: true
});

JournalEntry.associate = (models) => {
  JournalEntry.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  JournalEntry.belongsTo(models.Trip, { foreignKey: 'trip_id', as: 'trip' });
};

module.exports = JournalEntry;
