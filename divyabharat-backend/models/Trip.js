const { DataTypes } = require('sequelize');
const sequelize = require('@server/config/database');

const Trip = sequelize.define('Trip', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_days: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'trips',
  timestamps: true,
  underscored: true
});

Trip.associate = (models) => {
  Trip.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Trip.belongsToMany(models.Place, {
    through: models.TripPlace,
    foreignKey: 'trip_id',
    otherKey: 'place_id',
    as: 'places'
  });
  Trip.hasMany(models.TripPlace, { foreignKey: 'trip_id', as: 'tripPlaces' });
};

module.exports = Trip;
