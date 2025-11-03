/**
 * SIMPLIFIED AUTH ROUTES
 * 
 * This file defines all authentication-related API endpoints.
 * Each route is clearly documented with its purpose and middleware.
 * 
 * Route Structure:
 * - POST /register - Start registration process (generates OTP)
 * - POST /verify-otp-register - Complete registration with OTP
 * - POST /login - User login
 * - GET /profile - Get user profile (requires authentication)
 * - POST /logout - User logout
 */

import { Router } from 'express';
import { Pool } from 'mysql2/promise';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middleware/auth';
import { rateLimiterMiddleware } from '../../middleware/rateLimiter';
import { 
  validate, 
  loginSchema, 
  registerSchema, 
  verifyOTPAndRegisterSchema 
} from '../../schema/validation';

/**
 * CREATE AUTH ROUTES
 * 
 * This function creates and configures all authentication routes.
 * It takes a database connection and returns a configured Express router.
 * 
 * @param {Pool} db - Database connection pool
 * @returns {Router} Configured Express router with auth routes
 */
export function createAuthRoutes(db: Pool): Router {
  // Create Express router instance
  const router = Router();
  
  // Create auth controller instance with database connection
  const authController = new AuthController(db);

  // ========================================
  // PUBLIC ROUTES (No authentication required)
  // ========================================

  /**
   * POST /register
   * 
   * Purpose: Start user registration process
   * Process: 
   * 1. Validates user data
   * 2. Checks if user already exists
   * 3. Generates OTP
   * 4. Returns OTP for verification
   * 
   * Middleware:
   * - rateLimiterMiddleware: Prevents spam/abuse
   * - validate(registerSchema): Validates request data
   */
  router.post(
    '/register', 
    rateLimiterMiddleware,           // Apply rate limiting
    validate(registerSchema),        // Validate request data
    authController.register          // Handle registration
  );

  /**
   * POST /verify-otp-register
   * 
   * Purpose: Complete registration with OTP verification
   * Process:
   * 1. Validates registration data + OTP
   * 2. Verifies OTP
   * 3. Creates user account
   * 4. Returns user data and auth token
   * 
   * Middleware:
   * - rateLimiterMiddleware: Prevents spam/abuse
   * - validate(verifyOTPAndRegisterSchema): Validates request data
   */
  router.post(
    '/verify-otp-register', 
    rateLimiterMiddleware,                    // Apply rate limiting
    validate(verifyOTPAndRegisterSchema),     // Validate request data
    authController.verifyOTPAndRegister       // Handle OTP verification
  );

  /**
   * POST /login
   * 
   * Purpose: Authenticate user and generate token
   * Process:
   * 1. Validates login credentials
   * 2. Verifies email and password
   * 3. Generates JWT token
   * 4. Returns user data and token
   * 
   * Middleware:
   * - rateLimiterMiddleware: Prevents brute force attacks
   * - validate(loginSchema): Validates request data
   */
  router.post(
    '/login', 
    rateLimiterMiddleware,     // Apply rate limiting
    validate(loginSchema),      // Validate request data
    authController.login        // Handle login
  );

  // ========================================
  // PROTECTED ROUTES (Authentication required)
  // ========================================

  /**
   * GET /profile
   * 
   * Purpose: Get authenticated user's profile
   * Process:
   * 1. Verifies JWT token
   * 2. Gets user data from database
   * 3. Returns user profile
   * 
   * Middleware:
   * - authMiddleware: Verifies JWT token and sets req.user
   */
  router.get(
    '/profile', 
    authMiddleware,           // Require authentication
    authController.getProfile // Handle profile retrieval
  );

  /**
   * POST /logout
   * 
   * Purpose: Logout user (client-side token removal)
   * Process:
   * 1. Verifies JWT token
   * 2. Returns success message
   * 
   * Note: JWT tokens are stateless, so logout is handled client-side
   * by removing the token from storage.
   * 
   * Middleware:
   * - authMiddleware: Verifies JWT token
   */
  router.post(
    '/logout', 
    authMiddleware,        // Require authentication
    authController.logout  // Handle logout
  );

  // Return configured router
  return router;
}