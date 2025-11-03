/**
 * SIMPLIFIED AUTH MIDDLEWARE
 * 
 * This middleware handles JWT token verification for protected routes.
 * It extracts the token from the Authorization header, verifies it,
 * and adds user information to the request object.
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken, JWTPayload } from '../utils/auth';

// Extend Express Request interface to include user data
export interface AuthRequest extends Request {
  user?: JWTPayload;  // User data from JWT token
}

// Type for authentication middleware
type AuthMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

/**
 * AUTHENTICATION MIDDLEWARE
 * 
 * This middleware:
 * 1. Extracts JWT token from Authorization header
 * 2. Verifies the token
 * 3. Adds user data to request object
 * 4. Calls next() if valid, returns error if invalid
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const authMiddleware: AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Step 1: Get Authorization header from request
    const authHeader = req.header('Authorization');
    
    // Step 2: Extract token from "Bearer <token>" format
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)  // Remove "Bearer " prefix
      : null;

    // Step 3: Check if token exists
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided'
      });
      return;
    }

    // Step 4: Verify and decode JWT token
    const decoded = verifyToken(token);
    
    // Step 5: Add user data to request object
    (req as AuthRequest).user = decoded;

    // Step 6: Continue to next middleware/route handler
    next();
    
  } catch (error) {
    // Step 7: Handle token verification errors
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * AUTHORIZATION MIDDLEWARE FACTORY
 * 
 * This function creates middleware that checks if the authenticated user
 * has the required role(s) to access a route.
 * 
 * @param {...string} allowedRoles - Array of roles that can access the route
 * @returns {Function} Express middleware function
 */
export const authorize = (...allowedRoles: string[]): AuthMiddleware => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authReq = req as AuthRequest;
      
      // Step 1: Check if user is authenticated
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Step 2: Check if user has required role
      if (!allowedRoles.includes(authReq.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
        return;
      }

      // Step 3: User has required role, continue
      next();
      
    } catch (error) {
      // Step 4: Handle any errors
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Export authMiddleware as authenticate for backward compatibility
export const authenticate = authMiddleware;