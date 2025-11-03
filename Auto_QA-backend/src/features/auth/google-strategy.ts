/**
 * Google OAuth Strategy
 * Passport.js strategy for Google authentication
 */

import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Pool } from 'mysql2/promise';
import { googleOAuthConfig } from '../../config/google-oauth';
import { logger } from '../../utils/logger';
import { hashPassword } from '../../utils/auth';

interface GoogleUser {
  id: number;
  email: string;
  name: string;
  google_id: string;
  profile_picture?: string;
  role: string;
  email_verified: boolean;
}

export const configureGoogleStrategy = (db: Pool): void => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleOAuthConfig.clientID,
        clientSecret: googleOAuthConfig.clientSecret,
        callbackURL: googleOAuthConfig.callbackURL,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        try {
          logger.info('Google OAuth callback received', { profileId: profile.id });

          // Extract user information from Google profile
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.name?.givenName || 'Google User';
          const profilePicture = profile.photos?.[0]?.value;

          if (!email) {
            logger.error('No email provided by Google');
            return done(new Error('No email provided by Google'), undefined);
          }

          // Check if user already exists with this Google ID
          const [existingUsers] = await db.execute(
            'SELECT * FROM users WHERE google_id = ? OR email = ?',
            [googleId, email]
          );

          const userArray = existingUsers as any[];

          if (userArray.length > 0) {
            // User exists - update their information
            const existingUser = userArray[0];

            // Update Google ID if not set
            if (!existingUser.google_id) {
              await db.execute(
                'UPDATE users SET google_id = ?, profile_picture = ?, email_verified = true, updated_at = NOW() WHERE id = ?',
                [googleId, profilePicture, existingUser.id]
              );
            } else {
              // Just update last login and profile picture
              await db.execute(
                'UPDATE users SET profile_picture = ?, last_login = NOW(), updated_at = NOW() WHERE id = ?',
                [profilePicture, existingUser.id]
              );
            }

            logger.info('Existing user logged in via Google', { userId: existingUser.id });

            const user: GoogleUser = {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              google_id: googleId,
              profile_picture: profilePicture,
              role: existingUser.role,
              email_verified: true
            };

            return done(null, user);
          } else {
            // User doesn't exist - create new user
            // Generate a random password (won't be used for Google login)
            const randomPassword = await hashPassword(
              Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            );

            const [result] = await db.execute(
              `INSERT INTO users 
              (name, email, password, google_id, profile_picture, role, email_verified, is_active, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [name, email, randomPassword, googleId, profilePicture, 'qa_engineer', true, true]
            );

            const insertResult = result as any;
            const newUserId = insertResult.insertId;

            logger.info('New user created via Google OAuth', { userId: newUserId, email });

            const user: GoogleUser = {
              id: newUserId,
              email,
              name,
              google_id: googleId,
              profile_picture: profilePicture,
              role: 'qa_engineer',
              email_verified: true
            };

            return done(null, user);
          }
        } catch (error) {
          logger.error('Google OAuth error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );

  // Serialize user for session (optional, if using sessions)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session (optional, if using sessions)
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
      const userArray = users as any[];
      done(null, userArray[0]);
    } catch (error) {
      done(error, null);
    }
  });
};


