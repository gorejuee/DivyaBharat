const { DataTypes } = require('sequelize');
const sequelize = require('@server/config/database');

const User = sequelize.define('User', {
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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
    defaultValue: 'user',
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

User.associate = (models) => {
  User.belongsToMany(models.Place, {
    through: models.UserPlace,
    foreignKey: 'user_id',
    otherKey: 'place_id',
    as: 'visitedPlaces'
  });
};

module.exports = User;