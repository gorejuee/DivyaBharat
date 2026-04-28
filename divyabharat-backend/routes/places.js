const express = require('express');
const router = express.Router();
const {
    getAllPlaces,
    getPlaceById,
    submitPlace,
    getPendingPlaces,
    reviewPlace,
} = require('@server/controllers/placeController');
const authenticate = require('@server/middlewares/auth');
const requireAdmin = require('@server/middlewares/requireAdmin');

router.get('/', getAllPlaces);
router.get('/admin/pending', authenticate, requireAdmin, getPendingPlaces);
router.get('/:id', getPlaceById);
router.post('/submit', authenticate, submitPlace);
router.patch('/:id/review', authenticate, requireAdmin, reviewPlace);

module.exports = router;