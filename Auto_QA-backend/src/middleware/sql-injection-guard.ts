/**
 * SQL Injection Detection Middleware
 * Monitors and blocks potential SQL injection attacks
 */

import { Request, Response, NextFunction } from 'express';
import { InputSanitizer } from '../utils/input-sanitizer';
import { logger } from '../utils/logger';

export interface SQLInjectionGuardOptions {
  /**
   * Enable strict mode (block all suspicious input)
   */
  strictMode?: boolean;
  
  /**
   * Check query parameters
   */
  checkQuery?: boolean;
  
  /**
   * Check request body
   */
  checkBody?: boolean;
  
  /**
   * Check URL parameters
   */
  checkParams?: boolean;
  
  /**
   * Check headers
   */
  checkHeaders?: boolean;
  
  /**
   * Fields to skip checking (e.g., password fields)
   */
  skipFields?: string[];
  
  /**
   * Custom error message
   */
  errorMessage?: string;
  
  /**
   * Log attempts to file/database
   */
  logAttempts?: boolean;
}

/**
 * SQL Injection Guard Middleware
 * Scans incoming requests for SQL injection attempts
 */
export const sqlInjectionGuard = (options: SQLInjectionGuardOptions = {}) => {
  const {
    strictMode = true,
    checkQuery = true,
    checkBody = true,
    checkParams = true,
    checkHeaders = false,
    skipFields = ['password', 'token', 'refreshToken'],
    errorMessage = 'Invalid input detected',
    logAttempts = true
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const suspiciousInputs: { location: string; field: string; value: string }[] = [];

      /**
       * Check a value for SQL injection
       */
      const checkValue = (value: any, location: string, field: string): void => {
        if (typeof value === 'string' && !skipFields.includes(field)) {
          if (InputSanitizer.detectSQLInjection(value)) {
            suspiciousInputs.push({ location, field, value });
          }
        }
      };

      /**
       * Recursively check an object for SQL injection
       */
      const checkObject = (obj: any, location: string, prefix: string = ''): void => {
        if (!obj || typeof obj !== 'object') return;

        Object.keys(obj).forEach(key => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          const value = obj[key];

          if (typeof value === 'string') {
            checkValue(value, location, fullKey);
          } else if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                if (typeof item === 'string') {
                  checkValue(item, location, `${fullKey}[${index}]`);
                } else if (typeof item === 'object') {
                  checkObject(item, location, `${fullKey}[${index}]`);
                }
              });
            } else {
              checkObject(value, location, fullKey);
            }
          }
        });
      };

      // Check query parameters
      if (checkQuery && req.query) {
        checkObject(req.query, 'query');
      }

      // Check request body
      if (checkBody && req.body) {
        checkObject(req.body, 'body');
      }

      // Check URL parameters
      if (checkParams && req.params) {
        checkObject(req.params, 'params');
      }

      // Check headers (optional, more restrictive)
      if (checkHeaders && req.headers) {
        // Only check specific headers that might contain user input
        const headersToCheck = ['referer', 'user-agent', 'x-forwarded-for'];
        headersToCheck.forEach(header => {
          const value = req.headers[header];
          if (value && typeof value === 'string') {
            checkValue(value, 'headers', header);
          }
        });
      }

      // If suspicious input detected
      if (suspiciousInputs.length > 0) {
        // Log the attempt
        if (logAttempts) {
          logger.warn('SQL Injection attempt detected', {
            ip: req.ip,
            method: req.method,
            path: req.path,
            suspiciousInputs: suspiciousInputs.map(item => ({
              location: item.location,
              field: item.field,
              valuePreview: item.value.substring(0, 100) + '...'
            })),
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
          });
        }

        // In strict mode, block the request
        if (strictMode) {
          res.status(400).json({
            success: false,
            message: errorMessage,
            code: 'INVALID_INPUT'
          });
          return;
        } else {
          // In non-strict mode, just log and continue
          logger.info('SQL Injection attempt detected but allowed (non-strict mode)');
        }
      }

      next();
    } catch (error) {
      logger.error('Error in SQL injection guard middleware:', error);
      next(error);
    }
  };
};

/**
 * XSS Detection Middleware
 * Monitors and blocks potential XSS attacks
 */
export const xssGuard = (options: Omit<SQLInjectionGuardOptions, 'errorMessage'> & {
  errorMessage?: string;
} = {}) => {
  const {
    strictMode = true,
    checkQuery = true,
    checkBody = true,
    checkParams = true,
    skipFields = ['password', 'token', 'refreshToken'],
    errorMessage = 'Invalid input detected',
    logAttempts = true
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const suspiciousInputs: { location: string; field: string; value: string }[] = [];

      const checkValue = (value: any, location: string, field: string): void => {
        if (typeof value === 'string' && !skipFields.includes(field)) {
          if (InputSanitizer.detectXSS(value)) {
            suspiciousInputs.push({ location, field, value });
          }
        }
      };

      const checkObject = (obj: any, location: string, prefix: string = ''): void => {
        if (!obj || typeof obj !== 'object') return;

        Object.keys(obj).forEach(key => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          const value = obj[key];

          if (typeof value === 'string') {
            checkValue(value, location, fullKey);
          } else if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                if (typeof item === 'string') {
                  checkValue(item, location, `${fullKey}[${index}]`);
                } else if (typeof item === 'object') {
                  checkObject(item, location, `${fullKey}[${index}]`);
                }
              });
            } else {
              checkObject(value, location, fullKey);
            }
          }
        });
      };

      if (checkQuery && req.query) {
        checkObject(req.query, 'query');
      }

      if (checkBody && req.body) {
        checkObject(req.body, 'body');
      }

      if (checkParams && req.params) {
        checkObject(req.params, 'params');
      }

      if (suspiciousInputs.length > 0) {
        if (logAttempts) {
          logger.warn('XSS attempt detected', {
            ip: req.ip,
            method: req.method,
            path: req.path,
            suspiciousInputs: suspiciousInputs.map(item => ({
              location: item.location,
              field: item.field,
              valuePreview: item.value.substring(0, 100) + '...'
            })),
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
          });
        }

        if (strictMode) {
          res.status(400).json({
            success: false,
            message: errorMessage,
            code: 'INVALID_INPUT'
          });
          return;
        }
      }

      next();
    } catch (error) {
      logger.error('Error in XSS guard middleware:', error);
      next(error);
    }
  };
};

/**
 * Combined Security Guard
 * Checks for both SQL injection and XSS
 */
export const securityGuard = (options: SQLInjectionGuardOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    sqlInjectionGuard(options)(req, res, (err?: any) => {
      if (err) {
        next(err);
      } else if (!res.headersSent) {
        xssGuard(options)(req, res, next);
      }
    });
  };
};



