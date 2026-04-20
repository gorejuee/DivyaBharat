const { DataTypes } = require('sequelize');
const sequelize = require('@server/config/database');

const AiGuideCache = sequelize.define('AiGuideCache', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  place_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  question_hash: {
    type: DataTypes.STRING(32),
    allowNull: false
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'ai_guide_cache',
  timestamps: true,
  underscored: true
});

AiGuideCache.associate = (models) => {
  AiGuideCache.belongsTo(models.Place, {
    foreignKey: 'place_id',
    as: 'place'
  });
};

module.exports = AiGuideCache;