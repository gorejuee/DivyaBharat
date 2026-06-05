const User = require('@server/models/User');
const Place = require('@server/models/Place');
const AiGuideCache = require('@server/models/AiGuideCache');
const UserPlace = require('@server/models/UserPlace');
const Trip = require('@server/models/Trip');
const TripPlace = require('@server/models/TripPlace');
const JournalEntry = require('@server/models/JournalEntry');

const models = {
  User,
  Place,
  AiGuideCache,
  UserPlace,
  Trip,
  TripPlace,
  JournalEntry
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;