const express = require('express');
const router = express.Router();
const { askGuide } = require('@server/controllers/aiController');
const authenticate = require('@server/middlewares/auth');

router.post('/ask', authenticate, askGuide);

module.exports = router;