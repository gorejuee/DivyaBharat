const express = require('express');
const router = express.Router();
const passport = require('@server/config/passport');
const { register, login, googleCallback } = require('@server/controllers/authController');
const authenticate = require('@server/middlewares/auth');

router.post('/register', register);
router.post('/login', login);

router.get('/me', authenticate, (req, res) => {
  res.json({ message: 'Protected route works', user: req.user });
});

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=oauth_failed', session: false }),
  googleCallback
);

module.exports = router;