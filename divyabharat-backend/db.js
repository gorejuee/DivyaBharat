const User = require('@server/models/User');
const Place = require('@server/models/Place');
const AiGuideCache = require('@server/models/AiGuideCache');
const UserPlace = require('@server/models/UserPlace');

const models = { User, Place, AiGuideCache, UserPlace };

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;