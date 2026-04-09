const { Op } = require('sequelize');
const { Place } = require('@server/db');

const getAllPlaces = async (req, res) => {
  try {
    const { search, category, state } = req.query;
    const where = {};

    if (category) where.category = category;
    if (state) where.state = { [Op.iLike]: `%${state}%` };
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const places = await Place.findAll({
      where,
      attributes: [
        'id', 'name', 'description', 'category',
        'state', 'city', 'latitude', 'longitude', 'image_url'
      ],
      order: [['name', 'ASC']]
    });

    res.json({ places });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findOne({
      where: { id: req.params.id },
      attributes: [
        'id', 'name', 'description', 'history', 'category',
        'state', 'city', 'latitude', 'longitude', 'image_url', 'status'
      ]
    });

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.json({ place });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllPlaces, getPlaceById };