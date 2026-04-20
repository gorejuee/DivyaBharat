const User = require('@server/models/User');
const Place = require('@server/models/Place');
const AiGuideCache = require('@server/models/AiGuideCache');

const models = { User, Place, AiGuideCache };

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;