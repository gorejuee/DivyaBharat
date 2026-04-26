const express = require('express');
const router = express.Router();
const { getAllPlaces, getPlaceById } = require('@server/controllers/placeController');
const authenticate = require('@server/middlewares/auth');
const { submitPlace } = require('../controllers/placeController');

router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);
router.post('/submit', authenticate, submitPlace);

module.exports = router;