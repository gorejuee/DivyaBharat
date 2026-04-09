const User = require('@server/models/User');
const Place = require('@server/models/Place');

const models = { User, Place };

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;