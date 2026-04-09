const express = require('express');
const router = express.Router();
const { getAllPlaces, getPlaceById } = require('@server/controllers/placeController');

router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);

module.exports = router;