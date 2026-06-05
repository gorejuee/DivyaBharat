'use strict' 

const express = require('express');
const router = express.Router();
const {
  markVisited,
  unmarkVisited,
  getVisitedPlaces,
  getVisitedPlaceIds,
  updateVisit
} = require('@server/controllers/visitController');
const authenticate = require('@server/middlewares/auth');

router.get('/', authenticate, getVisitedPlaces);
router.get('/ids', authenticate, getVisitedPlaceIds);
router.post('/', authenticate, markVisited);
router.patch('/:placeId', authenticate, updateVisit);
router.delete('/:placeId', authenticate, unmarkVisited);

module.exports = router;