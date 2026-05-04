const express = require('express');
const passport = require('../config/passport');

const router = express.Router();

// GOOGLE
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:5173/auth-success',
    failureRedirect: 'http://localhost:5173/login',
  })
);

// FACEBOOK
router.get('/facebook', passport.authenticate('facebook'));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: 'http://localhost:5173/auth-success',
    failureRedirect: 'http://localhost:5173/login',
  })
);

// Bejelentkezett user lekérése
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nincs bejelentkezve' });
  }

  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    is_admin: req.user.is_admin,
    profile_image: req.user.profile_image || null,
  });
});

module.exports = router;