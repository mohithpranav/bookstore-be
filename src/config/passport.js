import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const setupPassport = (passport) => {
  const API_BASE_URL =
    process.env.API_BASE_URL || process.env.VITE_API_BASE_URL;

  // Register Google strategy if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${API_BASE_URL}/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email =
              profile.emails && profile.emails[0] && profile.emails[0].value;
            const name =
              profile.displayName ||
              (profile.name &&
                `${profile.name.givenName} ${profile.name.familyName}`) ||
              "Google User";

            if (!email)
              return done(new Error("No email found in Google profile"), null);

            let user = await User.findOne({ email });
            if (!user) {
              const randomPass = Math.random().toString(36).slice(-8);
              const hashed = await bcrypt.hash(randomPass, 10);
              user = await User.create({ name, email, password: hashed });
            }
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        },
      ),
    );
  } else {
    console.warn(
      "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.",
    );
  }

  // Register Facebook strategy if credentials are provided
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: `${API_BASE_URL}/auth/facebook/callback`,
          profileFields: ["id", "displayName", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email =
              profile.emails && profile.emails[0] && profile.emails[0].value;
            const name = profile.displayName || "Facebook User";

            if (!email)
              return done(
                new Error("No email found in Facebook profile"),
                null,
              );

            let user = await User.findOne({ email });
            if (!user) {
              const randomPass = Math.random().toString(36).slice(-8);
              const hashed = await bcrypt.hash(randomPass, 10);
              user = await User.create({ name, email, password: hashed });
            }
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        },
      ),
    );
  } else {
    console.warn(
      "Facebook OAuth not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to enable.",
    );
  }
};

export default setupPassport;
