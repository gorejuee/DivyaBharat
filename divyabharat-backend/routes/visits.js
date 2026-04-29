'use strict' 

const express = require('express');
const router = express.Router();
const {
  markVisited,
  unmarkVisited,
  getVisitedPlaces,
  getVisitedPlaceIds,
} = require('@server/controllers/visitController');
const authenticate = require('@server/middlewares/auth');

router.post('/', authenticate, markVisited);
router.delete('/:placeId', authenticate, unmarkVisited);
router.get('/', authenticate, getVisitedPlaces);
router.get('/ids', authenticate, getVisitedPlaceIds);

module.exports = router;