const express = require('express');
const passport = require('passport');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  googleCallback,
  getMe,
  logout,
  updatePreferences,
} = require('../controllers/auth.controller');

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:4200'}/?authError=1`,
  }),
  googleCallback
);

router.get('/me', requireAuth, getMe);

router.patch('/me', requireAuth, updatePreferences);

router.post('/logout', requireAuth, logout);

module.exports = router;
