const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      scope: ['profile', 'email']
    },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Update user info if needed
        user.displayName = user.displayName || profile.displayName;
        user.avatar = user.avatar || profile.photos?.[0]?.value;
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Check if user exists with same email
      const existingEmailUser = await User.findOne({ email: profile.emails?.[0]?.value });

      if (existingEmailUser) {
        // Link Google account to existing user
        existingEmailUser.googleId = profile.id;
        existingEmailUser.displayName = existingEmailUser.displayName || profile.displayName;
        existingEmailUser.avatar = existingEmailUser.avatar || profile.photos?.[0]?.value;
        existingEmailUser.lastLogin = new Date();
        existingEmailUser.isEmailVerified = true;
        await existingEmailUser.save();
        return done(null, existingEmailUser);
      }

      // Create new user
      const newUser = new User({
        googleId: profile.id,
        email: profile.emails?.[0]?.value,
        displayName: profile.displayName,
        avatar: profile.photos?.[0]?.value,
        isEmailVerified: true,
        lastLogin: new Date()
      });

      await newUser.save();
      done(null, newUser);

    } catch (error) {
      console.error('Google OAuth error:', error);
      done(error, null);
    }
  }));
}

// JWT Strategy for protecting routes (only if JWT_SECRET is provided)
if (process.env.JWT_SECRET) {
  passport.use(new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
  async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.userId).select('-password');

      if (user && user.isActive) {
        return done(null, user);
      }

      return done(null, false);

    } catch (error) {
      console.error('JWT Strategy error:', error);
      return done(error, false);
    }
  }));
}

module.exports = passport;
