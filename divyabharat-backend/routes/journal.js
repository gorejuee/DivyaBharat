const express = require('express');
const router = express.Router();
const authenticate = require('@server/middlewares/auth');
const { getEntries, createEntry, updateEntry, deleteEntry } = require('@server/controllers/journalController');

router.get('/', authenticate, getEntries);
router.post('/', authenticate, createEntry);
router.put('/:id', authenticate, updateEntry);
router.delete('/:id', authenticate, deleteEntry);

module.exports = router;
