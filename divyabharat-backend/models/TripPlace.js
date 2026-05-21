const { DataTypes } = require('sequelize');
const sequelize = require('@server/config/database');

const TripPlace = sequelize.define('TripPlace', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  trip_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  place_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  destination_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination_city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  destination_state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    get() {
      const val = this.getDataValue('latitude');
      return val ? parseFloat(val) : null;
    }
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    get() {
      const val = this.getDataValue('longitude');
      return val ? parseFloat(val) : null;
    }
  },
  day_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  duration_hours: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true,
    get() {
      const val = this.getDataValue('duration_hours');
      return val ? parseFloat(val) : null;
    }
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
  tableName: 'trip_places',
  timestamps: true,
  underscored: true
});

TripPlace.associate = (models) => {
  TripPlace.belongsTo(models.Trip, {
    foreignKey: 'trip_id',
    as: 'trip'
  });
  TripPlace.belongsTo(models.Place, {
    foreignKey: 'place_id',
    as: 'place'
  });
};

module.exports = TripPlace;
