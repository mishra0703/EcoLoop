const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const User = require("../models/User");

/**
 * We don't use passport sessions (no cookies-via-session, no serializeUser
 * session store) — the callback route issues its own JWT and the frontend
 * sends that JWT on every request afterwards. Passport here is only used to
 * run the OAuth handshake and hand us back the Google profile.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatarUrl = profile.photos?.[0]?.value || "";

        if (!email) {
          return done(
            new Error("Google account has no email on file."),
            undefined,
          );
        }

       let user = await User.findOne({ googleId });

        if (!user) {
          user = await User.findOneAndUpdate(
            { email },
            { googleId, name, email, avatarUrl },
            { upsert: true, new: true, setDefaultsOnInsert: true },
          );
        }

        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    },
  ),
);

module.exports = passport;
