const { User, Place } = require('@server/db');

const markVisited = async (req, res) => {
  try {
    const { placeId } = req.body;
    const userId = req.user.id;

    const place = await Place.findOne({
      where: { id: placeId },
      attributes: ['id', 'name']
    });

    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await user.addVisitedPlace(place);

    res.json({ message: 'Marked as visited.', placeId });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Already marked as visited.' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const unmarkVisited = async (req, res) => {
  try {
    const { placeId } = req.params;
    const userId = req.user.id;

    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const place = await Place.findOne({
      where: { id: placeId },
      attributes: ['id']
    });

    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    await user.removeVisitedPlace(place);

    res.json({ message: 'Removed from visited places.', placeId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getVisitedPlaces = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id'],
      include: [{
        association: 'visitedPlaces',
        attributes: [
          'id', 'name', 'category', 'state',
          'city', 'image_url', 'latitude', 'longitude'
        ],
        through: { attributes: ['visited_at'] }
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ places: user.visitedPlaces });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getVisitedPlaceIds = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id'],
      include: [{
        association: 'visitedPlaces',
        attributes: ['id'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const ids = user.visitedPlaces.map(p => p.id);
    res.json({ visitedPlaceIds: ids });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { markVisited, unmarkVisited, getVisitedPlaces, getVisitedPlaceIds };