'use strict';

const express = require('express');
const router = express.Router();
const {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  addStop,
  removeStop,
  updateStop,
  reorderStops,
  aiPlanTrip
} = require('@server/controllers/tripController');
const authenticate = require('@server/middlewares/auth');

router.post('/ai-plan', authenticate, aiPlanTrip);
router.get('/', authenticate, getTrips);
router.post('/', authenticate, createTrip);
router.get('/:id', authenticate, getTripById);
router.put('/:id', authenticate, updateTrip);
router.delete('/:id', authenticate, deleteTrip);
router.post('/:id/stops', authenticate, addStop);
router.delete('/:id/stops/:stopId', authenticate, removeStop);
router.patch('/:id/stops/:stopId', authenticate, updateStop);
router.put('/:id/stops/reorder', authenticate, reorderStops);

module.exports = router;
