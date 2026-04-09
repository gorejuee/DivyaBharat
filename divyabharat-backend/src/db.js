const User = require('@server/models/User');
const Place = require('@server/models/Place');

const models = { User, Place };

Object.values(models).forEach((models) => {
  if (models.associate) {
    models.associate(models);
  }
});

module.exports = models;