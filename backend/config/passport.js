const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { User } = require('../models');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;

        let user = await User.findOne({
          where: { email },
        });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: email,
            password: null,
            google_id: profile.id,
            profile_image: profile.photos?.[0]?.value || null,
          });
        } else if (!user.google_id) {
          user.google_id = profile.id;
          if (!user.profile_image && profile.photos?.[0]?.value) {
            user.profile_image = profile.photos[0].value;
          }
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:5000/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;

        let user = null;

        if (email) {
          user = await User.findOne({ where: { email } });
        }

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: email,
            password: null,
            facebook_id: profile.id,
            profile_image: profile.photos?.[0]?.value || null,
          });
        } else if (!user.facebook_id) {
          user.facebook_id = profile.id;
          if (!user.profile_image && profile.photos?.[0]?.value) {
            user.profile_image = profile.photos[0].value;
          }
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;