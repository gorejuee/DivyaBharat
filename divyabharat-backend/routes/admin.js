'use strict';

const express = require('express');
const router = express.Router();
const { triggerImport } = require('@server/controllers/importController');
const authenticate = require('@server/middlewares/auth');
const requireAdmin = require('@server/middlewares/requireAdmin');

router.post('/import-wikidata', authenticate, requireAdmin, triggerImport);

module.exports = router;