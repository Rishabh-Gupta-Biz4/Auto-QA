/**
 * Permission Middleware
 * Following Node.js rules: Use permission middleware for route restrictions
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { ResponseHandler } from "../utils/response";
import { AuthRequest } from "./auth";

/**
 * Permission levels for the application
 * Following Node.js rules: Define clear permission structure
 */
export enum Permission {
  // Test Cases permissions
  GENERATE_TEST_CASES = "generate_test_cases",
  SAVE_TEST_CASES = "save_test_cases", 
  VIEW_TEST_CASES = "view_test_cases",
  MANAGE_TEST_CASES = "manage_test_cases",
  
  // Project permissions
  VIEW_PROJECTS = "view_projects",
  MANAGE_PROJECTS = "manage_projects",
  
  // Admin permissions
  ADMIN_ACCESS = "admin_access"
}

/**
 * User roles and their associated permissions
 * Following Node.js rules: Centralized permission mapping
 */
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  user: [
    Permission.GENERATE_TEST_CASES,
    Permission.SAVE_TEST_CASES,
    Permission.VIEW_TEST_CASES,
    Permission.VIEW_PROJECTS
  ],
  developer: [
    Permission.GENERATE_TEST_CASES,
    Permission.SAVE_TEST_CASES,
    Permission.VIEW_TEST_CASES,
    Permission.MANAGE_TEST_CASES,
    Permission.VIEW_PROJECTS,
    Permission.MANAGE_PROJECTS
  ],
  premium: [
    Permission.GENERATE_TEST_CASES,
    Permission.SAVE_TEST_CASES,
    Permission.VIEW_TEST_CASES,
    Permission.MANAGE_TEST_CASES,
    Permission.VIEW_PROJECTS,
    Permission.MANAGE_PROJECTS
  ],
  admin: [
    Permission.GENERATE_TEST_CASES,
    Permission.SAVE_TEST_CASES,
    Permission.VIEW_TEST_CASES,
    Permission.MANAGE_TEST_CASES,
    Permission.VIEW_PROJECTS,
    Permission.MANAGE_PROJECTS,
    Permission.ADMIN_ACCESS
  ]
};

/**
 * Check if user has required permission
 * Following Node.js rules: Utility functions in reusable modules
 */
function hasPermission(userRole: string, requiredPermission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(requiredPermission);
}

/**
 * Permission middleware factory function
 * Following Node.js rules: Reusable middleware with dependency injection
 */
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authReq = req as AuthRequest;
      const user = authReq.user;
      
      if (!user) {
        logger.warn("Permission check failed: No user in request", {
          permission,
          path: req.path,
          method: req.method
        });
        ResponseHandler.unauthorized(res, "Authentication required");
        return;
      }

      const userRole = user.role || "user"; // Default to 'user' role
      
      if (!hasPermission(userRole, permission)) {
        logger.warn("Permission denied", {
          userId: user.userId,
          userRole,
          requiredPermission: permission,
          path: req.path,
          method: req.method
        });
        ResponseHandler.forbidden(res, `Insufficient permissions. Required: ${permission}`);
        return;
      }

      logger.info("Permission granted", {
        userId: user.userId,
        userRole,
        permission,
        path: req.path,
        method: req.method
      });

      next();

    } catch (error) {
      logger.error("Permission middleware error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        permission,
        path: req.path,
        method: req.method
      });
      ResponseHandler.internalError(res, "Permission check failed");
    }
  };
};

/**
 * Convenient permission middleware functions
 * Following Node.js rules: Export commonly used configurations
 */
export const requireTestCaseGeneration = requirePermission(Permission.GENERATE_TEST_CASES);
export const requireTestCaseSave = requirePermission(Permission.SAVE_TEST_CASES);
export const requireTestCaseView = requirePermission(Permission.VIEW_TEST_CASES);
export const requireProjectView = requirePermission(Permission.VIEW_PROJECTS);
