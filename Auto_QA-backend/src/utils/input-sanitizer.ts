/**
 * Input Sanitization Utility
 * Comprehensive input validation and sanitization to prevent SQL injection and XSS attacks
 */

import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

export class InputSanitizer {
  
  /**
   * SQL Injection Patterns
   * Common SQL injection attack patterns to detect
   */
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|\#|\/\*|\*\/)/g, // SQL comments
    /(\bOR\b.*=.*|1=1|1='1')/gi, // Common OR injection
    /(\bAND\b.*=.*)/gi, // AND injection
    /('|";?|";\s*DROP)/gi, // Quote-based injection
    /(UNION\s+SELECT)/gi, // Union-based injection
    /(CONCAT|CHAR|ASCII|HEX|UNHEX|LOAD_FILE|INTO\s+OUTFILE)/gi, // Function-based injection
    /(xp_cmdshell|sp_executesql)/gi, // SQL Server specific
    /(SLEEP|BENCHMARK|WAITFOR\s+DELAY)/gi, // Time-based injection
  ];

  /**
   * XSS Attack Patterns
   */
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  /**
   * Detect potential SQL injection attempts in input
   */
  static detectSQLInjection(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    
    return this.SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
  }

  /**
   * Detect potential XSS attempts in input
   */
  static detectXSS(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    
    return this.XSS_PATTERNS.some(pattern => pattern.test(input));
  }

  /**
   * Sanitize string input by removing dangerous characters
   */
  static sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Remove control characters except newline and tab
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    return sanitized;
  }

  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'title'],
    });
  }

  /**
   * Validate and sanitize email
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';
    
    const sanitized = this.sanitizeString(email).toLowerCase();
    
    if (!validator.isEmail(sanitized)) {
      throw new Error('Invalid email format');
    }
    
    return sanitized;
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeURL(url: string): string {
    if (!url || typeof url !== 'string') return '';
    
    const sanitized = this.sanitizeString(url);
    
    if (!validator.isURL(sanitized, { protocols: ['http', 'https'], require_protocol: true })) {
      throw new Error('Invalid URL format');
    }
    
    return sanitized;
  }

  /**
   * Sanitize integer input
   */
  static sanitizeInteger(input: any): number {
    const num = parseInt(input, 10);
    
    if (isNaN(num)) {
      throw new Error('Invalid integer value');
    }
    
    return num;
  }

  /**
   * Sanitize float input
   */
  static sanitizeFloat(input: any): number {
    const num = parseFloat(input);
    
    if (isNaN(num)) {
      throw new Error('Invalid float value');
    }
    
    return num;
  }

  /**
   * Sanitize boolean input
   */
  static sanitizeBoolean(input: any): boolean {
    if (typeof input === 'boolean') return input;
    if (typeof input === 'string') {
      const lower = input.toLowerCase().trim();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }
    if (typeof input === 'number') return input !== 0;
    
    throw new Error('Invalid boolean value');
  }

  /**
   * Sanitize alphanumeric input (letters and numbers only)
   */
  static sanitizeAlphanumeric(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input.replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Sanitize database identifier (table/column names)
   * Only allows alphanumeric characters and underscores
   */
  static sanitizeIdentifier(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    const sanitized = input.replace(/[^a-zA-Z0-9_]/g, '');
    
    // Ensure it doesn't start with a number
    if (/^\d/.test(sanitized)) {
      throw new Error('Identifier cannot start with a number');
    }
    
    // Ensure it's not empty
    if (!sanitized) {
      throw new Error('Identifier cannot be empty');
    }
    
    return sanitized;
  }

  /**
   * Sanitize phone number
   */
  static sanitizePhoneNumber(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove all non-digit characters except +
    const sanitized = input.replace(/[^\d+]/g, '');
    
    if (!validator.isMobilePhone(sanitized, 'any')) {
      throw new Error('Invalid phone number format');
    }
    
    return sanitized;
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJSON(input: string): any {
    if (!input || typeof input !== 'string') return null;
    
    try {
      return JSON.parse(input);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Comprehensive input sanitization for objects
   * Recursively sanitizes all string values in an object
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T, options: {
    detectInjection?: boolean;
    detectXSS?: boolean;
  } = {}): T {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Detect attacks if enabled
        if (options.detectInjection && this.detectSQLInjection(value)) {
          throw new Error(`Potential SQL injection detected in field: ${key}`);
        }
        if (options.detectXSS && this.detectXSS(value)) {
          throw new Error(`Potential XSS attack detected in field: ${key}`);
        }
        
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value, options);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeString(item) :
          typeof item === 'object' ? this.sanitizeObject(item, options) :
          item
        );
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized as T;
  }

  /**
   * Validate SQL ORDER BY clause
   * Only allows safe column names and ASC/DESC
   */
  static validateOrderBy(orderBy: string): string {
    if (!orderBy || typeof orderBy !== 'string') {
      throw new Error('Invalid ORDER BY clause');
    }
    
    const parts = orderBy.trim().split(/\s+/);
    
    if (parts.length > 2) {
      throw new Error('Invalid ORDER BY format');
    }
    
    // Validate column name
    const column = this.sanitizeIdentifier(parts[0]);
    
    // Validate direction if provided
    const direction = parts[1]?.toUpperCase();
    if (direction && direction !== 'ASC' && direction !== 'DESC') {
      throw new Error('Invalid ORDER BY direction');
    }
    
    return direction ? `${column} ${direction}` : column;
  }

  /**
   * Validate SQL LIMIT clause
   */
  static validateLimit(limit: any, maxLimit: number = 1000): number {
    const num = this.sanitizeInteger(limit);
    
    if (num < 1) {
      throw new Error('LIMIT must be positive');
    }
    
    if (num > maxLimit) {
      throw new Error(`LIMIT cannot exceed ${maxLimit}`);
    }
    
    return num;
  }

  /**
   * Validate SQL OFFSET clause
   */
  static validateOffset(offset: any): number {
    const num = this.sanitizeInteger(offset);
    
    if (num < 0) {
      throw new Error('OFFSET must be non-negative');
    }
    
    return num;
  }
}



