/**
 * Test Cases Validation Layer
 * Following Node.js rules: Centralized validation using Joi
 */

import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../utils/logger";

/**
 * Validation schema for test case generation request
 */
export const generateTestCasesSchema = Joi.object({
  websiteUrl: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required()
    .messages({
      "string.uri": "Website URL must be a valid HTTP or HTTPS URL",
      "any.required": "Website URL is required"
    }),
  
  username: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username cannot exceed 50 characters",
      "any.required": "Username is required"
    }),
  
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long", 
      "string.max": "Password cannot exceed 100 characters",
      "any.required": "Password is required"
    }),
  
  moduleFlow: Joi.string()
    .min(20)
    .max(2000)
    .required()
    .messages({
      "string.min": "Module flow description must be at least 20 characters long",
      "string.max": "Module flow description cannot exceed 2000 characters",
      "any.required": "Module flow description is required"
    }),
  
  additionalNotes: Joi.string()
    .max(1000)
    .optional()
    .allow("")
    .messages({
      "string.max": "Additional notes cannot exceed 1000 characters"
    })
});

/**
 * Validation schema for saving test cases request
 */
export const saveTestCasesSchema = Joi.object({
  projectData: Joi.object({
    websiteUrl: Joi.string().uri({ scheme: ["http", "https"] }).required(),
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).max(100).required(),
    moduleFlow: Joi.string().min(20).max(2000).required(),
    additionalNotes: Joi.string().max(1000).optional().allow("")
  }).required(),
  
  testCases: Joi.array()
    .items(
      Joi.object({
        testId: Joi.string().max(20).required(),
        testDescription: Joi.string().min(10).max(1000).required(),
        testEndpoints: Joi.string().max(500).required(),
        comments: Joi.string().max(500).required()
      })
    )
    .min(1)
    .max(500)
    .required()
    .messages({
      "array.min": "At least one test case is required",
      "array.max": "Cannot save more than 500 test cases at once"
    })
});

/**
 * Validation schema for project Id parameter
 */
export const projectIdSchema = Joi.object({
  projectId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Project Id must be a number",
      "number.integer": "Project Id must be an integer",
      "number.positive": "Project Id must be a positive number",
      "any.required": "Project Id is required"
    })
});

/**
 * Middleware function to validate request data using Joi schemas
 * Following Node.js rules: Reusable validation middleware
 * 
 * @param schema - Joi validation schema
 * @param property - Request property to validate ('body', 'params', 'query')
 */
export const validateRequest = (schema: Joi.ObjectSchema, property: "body" | "params" | "query" = "body") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[property];
      
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false, // Collect all validation errors
        stripUnknown: true // Remove unknown properties
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value
        }));

        logger.error("Validation failed for test-cases request", {
          property,
          errors: validationErrors,
          originalData: dataToValidate
        });

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors
        });
        return;
      }

      // Replace the original data with validated and sanitized data
      req[property] = value;
      next();

    } catch (validationError) {
      logger.error("Unexpected validation error in test-cases", {
        error: validationError,
        property,
        data: req[property]
      });

      res.status(500).json({
        success: false,
        message: "Internal validation error"
      });
    }
  };
};

/**
 * Export validation middlewares for direct use in routes
 * Following Node.js rules: Feature-based modular exports
 */
export const validateGenerateTestCases = validateRequest(generateTestCasesSchema, "body");
export const validateSaveTestCases = validateRequest(saveTestCasesSchema, "body");  
export const validateProjectId = validateRequest(projectIdSchema, "params");
