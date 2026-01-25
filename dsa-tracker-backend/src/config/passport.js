const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists by googleId
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        return done(null, user);
                    }

                    // Check if user exists by email
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // Link googleId to existing user
                        user.googleId = profile.id;
                        await user.save();
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Dummy password
                    });

                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
} else {
    console.warn('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not found in .env. Google Auth disabled.');
}

module.exports = passport;
