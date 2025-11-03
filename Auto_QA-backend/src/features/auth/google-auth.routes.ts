/**
 * Google OAuth Routes
 * Routes for Google social login
 */

import { Router } from 'express';
import { Pool } from 'mysql2/promise';
import { GoogleAuthController } from './google-auth.controller';

export const createGoogleAuthRoutes = (db: Pool): Router => {
  const router = Router();
  const controller = new GoogleAuthController(db);

  /**
   * @route   GET /api/v1/auth/google
   * @desc    Initiate Google OAuth flow
   * @access  Public
   */
  router.get('/google', controller.initiateGoogleAuth);

  /**
   * @route   GET /api/v1/auth/google/callback
   * @desc    Google OAuth callback (redirect)
   * @access  Public
   */
  router.get('/google/callback', controller.googleAuthCallback);

  /**
   * @route   GET /api/v1/auth/google/status
   * @desc    Check if Google OAuth is configured
   * @access  Public
   */
  router.get('/google/status', controller.checkGoogleAuthStatus);

  return router;
};


