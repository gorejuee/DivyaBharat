const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('@server/models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName;

        // check if user exists by google_id first
        let user = await User.findOne({
          where: { google_id: googleId },
          attributes: ['id', 'name', 'email', 'role']
        });

        if (user) return done(null, user);

        // check if email already exists (registered manually before)
        user = await User.findOne({
          where: { email },
          attributes: ['id', 'name', 'email', 'role']
        });

        if (user) {
          // link google_id to existing account
          await user.update({ google_id: googleId });
          return done(null, user);
        }

        // new user, create with no password
        user = await User.create({
          name,
          email,
          password: null,
          google_id: googleId
        });

        // return only safe attributes
        return done(null, {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;