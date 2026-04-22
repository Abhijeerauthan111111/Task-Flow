const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

function configurePassport() {
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user || null);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value || "";
          const photoUrl = profile.photos?.[0]?.value || "";
          const suggestedName = profile.displayName || profile.name?.givenName || "";

          let user = await User.findOne({ googleId });
          if (!user) {
            user = await User.create({
              googleId,
              email,
              name: suggestedName,
              photoUrl,
              profileComplete: false
            });
          }

          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

module.exports = { configurePassport };

