/**
 * SIMPLIFIED VALIDATION SCHEMAS
 * 
 * This file contains Joi validation schemas for authentication endpoints.
 * Each schema defines the required fields and validation rules for API requests.
 */

import Joi from 'joi';

/**
 * LOGIN VALIDATION SCHEMA
 * 
 * Validates user login request:
 * - email: Must be a valid email address
 * - password: Must be at least 6 characters long
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()                    // Must be a valid email format
    .required()                 // Field is required
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)                     // Minimum 6 characters
    .required()                 // Field is required
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    })
});

/**
 * REGISTRATION VALIDATION SCHEMA
 * 
 * Validates user registration request:
 * - name: Must be 2-50 characters
 * - email: Must be a valid email address
 * - password: Must be 8-128 characters
 * - role: Optional, must be one of the allowed roles
 */
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)                     // Minimum 2 characters
    .max(50)                    // Maximum 50 characters
    .required()                 // Field is required
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 50 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()                    // Must be a valid email format
    .required()                 // Field is required
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)                     // Minimum 8 characters
    .max(128)                   // Maximum 128 characters
    .required()                 // Field is required
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'any.required': 'Password is required'
    }),
  
  role: Joi.string()
    .valid('admin', 'qa_lead', 'qa_engineer', 'developer')  // Must be one of these values
    .optional()                 // Field is optional
    .default('qa_engineer')     // Default value if not provided
    .messages({
      'any.only': 'Role must be one of: admin, qa_lead, qa_engineer, developer'
    })
});

/**
 * OTP VERIFICATION SCHEMA
 * 
 * Validates OTP verification request:
 * - name: Must be 2-50 characters
 * - email: Must be a valid email address
 * - password: Must be 8-128 characters
 * - role: Optional, must be one of the allowed roles
 * - otp: Must be exactly 6 digits
 */
export const verifyOTPAndRegisterSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 50 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'any.required': 'Password is required'
    }),
  
  role: Joi.string()
    .valid('admin', 'qa_lead', 'qa_engineer', 'developer')
    .optional()
    .default('qa_engineer')
    .messages({
      'any.only': 'Role must be one of: admin, qa_lead, qa_engineer, developer'
    }),
  
  otp: Joi.string()
    .length(6)                  // Must be exactly 6 characters
    .pattern(/^\d{6}$/)         // Must be exactly 6 digits
    .required()                 // Field is required
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'OTP is required'
    })
});

/**
 * VALIDATION MIDDLEWARE FACTORY
 * 
 * This function creates middleware that validates request data against a schema.
 * It can be used for both request body and query parameters.
 * 
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against
 * @param {string} target - What to validate ('body' or 'query')
 * @returns {Function} Express middleware function
 */
export const validate = (schema: Joi.ObjectSchema, target: 'body' | 'query' = 'body') => {
  return (req: any, res: any, next: any) => {
    // Get data to validate based on target
    const dataToValidate = target === 'body' ? req.body : req.query;
    
    // Validate data against schema
    const { error, value } = schema.validate(dataToValidate, { 
      abortEarly: false,        // Return all validation errors, not just the first one
      stripUnknown: true        // Remove fields not defined in schema
    });

    // If validation fails, return error response
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }

    // If validation passes, replace original data with validated data
    if (target === 'body') {
      req.body = value;
    } else {
      req.query = value;
    }
    
    // Continue to next middleware
    next();
  };
};

/**
 * QUERY VALIDATION MIDDLEWARE
 * 
 * Convenience function for validating query parameters
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against
 * @returns {Function} Express middleware function
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return validate(schema, 'query');
};