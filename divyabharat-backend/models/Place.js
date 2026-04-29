const { DataTypes } = require('sequelize');
const sequelize = require('@server/config/database');

const Place = sequelize.define('Place', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  history: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
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
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
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
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  submitted_by: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'places',
  timestamps: true,
  underscored: true,
  defaultScope: {
    where: {
      status: 'approved'
    }
  },
  indexes: [
    { fields: ['category'] },
    { fields: ['state'] },
    { fields: ['city'] },
    { fields: ['status'] }
  ]
});

Place.associate = (models) => {
  Place.belongsTo(models.User, {
    foreignKey: 'submitted_by',
    as: 'submittedBy'
  });
  Place.belongsToMany(models.User, {
    through: models.UserPlace,
    foreignKey: 'place_id',
    otherKey: 'user_id',
    as: 'visitedByUsers'
  });
};

module.exports = Place;