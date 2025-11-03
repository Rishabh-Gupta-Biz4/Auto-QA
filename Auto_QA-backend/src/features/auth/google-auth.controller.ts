/**
 * Google OAuth Controller
 * Handles Google authentication flow
 */

import { Request, Response, NextFunction } from 'express';
import { Pool } from 'mysql2/promise';
import passport from 'passport';
import { generateToken, generateRefreshToken } from '../../utils/auth';
import { logger } from '../../utils/logger';

export class GoogleAuthController {
  constructor(private db: Pool) {}

  /**
   * Initiate Google OAuth flow
   * Redirects user to Google's OAuth consent screen
   */
  public initiateGoogleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  });

  /**
   * Google OAuth callback handler
   * Called after user authorizes the app on Google
   */
  public googleAuthCallback = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('google', { session: false }, async (err: any, user: any, info: any) => {
      try {
        if (err) {
          logger.error('Google OAuth error:', err);
          // Redirect to frontend with error
          return res.redirect(
            `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`
          );
        }

        if (!user) {
          logger.warn('Google OAuth: No user returned');
          return res.redirect(
            `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=no_user`
          );
        }

        // Generate JWT tokens
        const accessToken = generateToken({
          id: user.id,
          email: user.email,
          role: user.role
        });

        const refreshToken = generateRefreshToken({
          id: user.id,
          email: user.email
        });

        // Update last login
        await this.db.execute(
          'UPDATE users SET last_login = NOW() WHERE id = ?',
          [user.id]
        );

        logger.info('Google OAuth successful', { userId: user.id, email: user.email });

        // Redirect to frontend with tokens
        // You can either:
        // 1. Pass tokens in URL (less secure but simpler)
        // 2. Set them as httpOnly cookies (more secure)
        
        // Option 1: URL parameters (for development)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/auth/google/callback?token=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profile_picture
        }))}`;

        res.redirect(redirectUrl);

      } catch (error) {
        logger.error('Google OAuth callback error:', error);
        res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=server_error`
        );
      }
    })(req, res, next);
  };

  /**
   * Alternative: Return tokens as JSON (for API-based approach)
   */
  public googleAuthCallbackJSON = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('google', { session: false }, async (err: any, user: any) => {
      try {
        if (err || !user) {
          res.status(401).json({
            success: false,
            message: 'Google authentication failed',
            error: err?.message
          });
          return;
        }

        // Generate JWT tokens
        const accessToken = generateToken({
          id: user.id,
          email: user.email,
          role: user.role
        });

        const refreshToken = generateRefreshToken({
          id: user.id,
          email: user.email
        });

        // Update last login
        await this.db.execute(
          'UPDATE users SET last_login = NOW() WHERE id = ?',
          [user.id]
        );

        res.status(200).json({
          success: true,
          message: 'Google authentication successful',
          data: {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              profilePicture: user.profile_picture,
              emailVerified: user.email_verified
            },
            accessToken,
            refreshToken
          }
        });

      } catch (error) {
        logger.error('Google OAuth JSON callback error:', error);
        res.status(500).json({
          success: false,
          message: 'Server error during Google authentication'
        });
      }
    })(req, res, next);
  };

  /**
   * Check Google OAuth configuration status
   */
  public checkGoogleAuthStatus = async (req: Request, res: Response): Promise<void> => {
    const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

    res.status(200).json({
      success: true,
      data: {
        googleAuthEnabled: isConfigured,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'Not configured'
      }
    });
  };
}

