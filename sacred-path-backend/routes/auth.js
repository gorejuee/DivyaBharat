const express = require('express');
const router = express.Router();
const { register, login } = require('@server/controllers/authController');
const authenticate = require('@server/middlewares/auth');

router.post('/register', register);
router.post('/login', login);

router.get('/me', authenticate, (req, res) => {
    res.json({ message: 'Protected route works', user: req.user });
});

module.exports = router;