/**
 * Test Cases Routes
 * API endpoints for test case generation and management
 */

import { Router } from "express";
import { Pool } from "mysql2/promise";
import { createTestCasesController } from "./test-cases.controller";
import { authMiddleware } from "../../middleware/auth";
import { rateLimiter } from "../../middleware/rateLimiter";
import { 
  requireTestCaseGeneration,
  requireTestCaseSave,
  requireTestCaseView,
  requireProjectView
} from "../../middleware/permissions";
import { 
  validateGenerateTestCases,
  validateSaveTestCases,
  validateProjectId
} from "./validation";

export const createTestCasesRoutes = (database: Pool): Router => {
  const router = Router();
  const testCasesController = createTestCasesController(database);

  // Apply authentication middleware to all routes
  router.use(authMiddleware);

  /**
   * @swagger
   * /api/v1/test-cases/generate:
   *   post:
   *     tags: [Test Cases]
   *     summary: Generate test cases using AI
   *     description: Generate comprehensive test cases based on website URL, credentials, and module flow
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - websiteUrl
   *               - username
   *               - password
   *               - moduleFlow
   *             properties:
   *               websiteUrl:
   *                 type: string
   *                 format: url
   *                 example: "https://example.com"
   *                 description: "URL of the website to test"
   *               username:
   *                 type: string
   *                 example: "testuser"
   *                 description: "Test username for the application"
   *               password:
   *                 type: string
   *                 example: "testpass123"
   *                 description: "Test password for the application"
   *               moduleFlow:
   *                 type: string
   *                 example: "User login flow - Navigate to login page, enter credentials, click login button, verify successful login"
   *                 description: "Detailed description of the module flow to test (minimum 20 characters)"
   *               additionalNotes:
   *                 type: string
   *                 example: "Test on Chrome and Firefox browsers, check mobile responsiveness"
   *                 description: "Optional additional requirements or notes"
   *     responses:
   *       200:
   *         description: Test cases generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Test cases generated successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     testCases:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           testId:
   *                             type: string
   *                             example: "TC001"
   *                           testDescription:
   *                             type: string
   *                             example: "Verify successful login with valid credentials"
   *                           testEndpoints:
   *                             type: string
   *                             example: "/api/auth/login, /dashboard"
   *                           comments:
   *                             type: string
   *                             example: "User should be redirected to dashboard after login"
   *                     metadata:
   *                       type: object
   *                       properties:
   *                         generatedCount:
   *                           type: number
   *                           example: 8
   *                         websiteUrl:
   *                           type: string
   *                           example: "https://example.com"
   *                         serviceProvider:
   *                           type: string
   *                           example: "OpenAI GPT-3.5"
   *                         generatedAt:
   *                           type: string
   *                           format: date-time
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Internal server error
   */
  router.post("/generate-test-cases", rateLimiter, requireTestCaseGeneration, validateGenerateTestCases, testCasesController.generateTestCases);

  /**
   * @swagger
   * /api/v1/test-cases/save:
   *   post:
   *     tags: [Test Cases]
   *     summary: Save generated test cases
   *     description: Save test cases to database for future reference and execution
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - projectData
   *               - testCases
   *             properties:
   *               projectData:
   *                 type: object
   *                 properties:
   *                   websiteUrl:
   *                     type: string
   *                     format: url
   *                   username:
   *                     type: string
   *                   password:
   *                     type: string
   *                   moduleFlow:
   *                     type: string
   *                   additionalNotes:
   *                     type: string
   *               testCases:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     testId:
   *                       type: string
   *                     testDescription:
   *                       type: string
   *                     testEndpoints:
   *                       type: string
   *                     comments:
   *                       type: string
   *     responses:
   *       200:
   *         description: Test cases saved successfully
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Internal server error
   */
  router.post("/save-test-cases", requireTestCaseSave, validateSaveTestCases, testCasesController.saveTestCases);

  /**
   * @swagger
   * /api/v1/test-cases/execute-test-cases:
   *   post:
   *     tags: [Test Cases]
   *     summary: Execute test cases automatically using provided credentials
   *     description: Runs all generated test cases against the target website using provided credentials and generates execution metrics
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - websiteUrl
   *               - username
   *               - password
   *               - testCases
   *               - projectName
   *             properties:
   *               websiteUrl:
   *                 type: string
   *                 description: Target website URL for test execution
   *                 example: "https://example.com"
   *               username:
   *                 type: string
   *                 description: Login username for the website
   *                 example: "testuser@example.com"
   *               password:
   *                 type: string
   *                 description: Login password for the website
   *                 example: "password123"
   *               testCases:
   *                 type: array
   *                 description: Array of test cases to execute
   *                 items:
   *                   type: object
   *                   properties:
   *                     testId:
   *                       type: string
   *                       example: "TC001"
   *                     testDescription:
   *                       type: string
   *                       example: "Login with valid credentials"
   *                     testEndpoints:
   *                       type: string
   *                       example: "/login, /dashboard"
   *                     comments:
   *                       type: string
   *                       example: "Should redirect to dashboard"
   *               projectName:
   *                 type: string
   *                 description: Name for the test execution project
   *                 example: "E-commerce Login Flow Test"
   *               moduleFlow:
   *                 type: string
   *                 description: Description of the module flow being tested
   *                 example: "User login and dashboard access flow"
   *               additionalNotes:
   *                 type: string
   *                 description: Additional notes or context for the test execution
   *                 example: "Test with Chrome browser on Windows"
   *     responses:
   *       200:
   *         description: Test cases executed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Test cases executed successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     projectId:
   *                       type: number
   *                       example: 123
   *                     executionId:
   *                       type: number
   *                       example: 456
   *                     summary:
   *                       type: object
   *                       properties:
   *                         total:
   *                           type: number
   *                           example: 25
   *                         passed:
   *                           type: number
   *                           example: 20
   *                         failed:
   *                           type: number
   *                           example: 5
   *                         skipped:
   *                           type: number
   *                           example: 0
   *                         successRate:
   *                           type: number
   *                           example: 80
   *                         totalDuration:
   *                           type: number
   *                           example: 45000
   *                         avgDuration:
   *                           type: number
   *                           example: 1800
   *                     results:
   *                       type: array
   *                       description: Sample of execution results (limited to first 10)
   *                       items:
   *                         type: object
   *                         properties:
   *                           testId:
   *                             type: string
   *                             example: "TC001"
   *                           status:
   *                             type: string
   *                             enum: [passed, failed, skipped]
   *                             example: "passed"
   *                           duration:
   *                             type: number
   *                             example: 1200
   *                           errorMessage:
   *                             type: string
   *                             example: "Element not found"
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Insufficient permissions
   *       500:
   *         description: Internal server error
   */
  router.post("/execute-test-cases", requireTestCaseGeneration, testCasesController.executeTestCases);

  /**
   * @swagger
   * /api/v1/test-cases/projects:
   *   get:
   *     tags: [Test Cases]
   *     summary: Get user's test case projects
   *     description: Retrieve all projects with test cases for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Projects retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     projects:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: number
   *                           name:
   *                             type: string
   *                           description:
   *                             type: string
   *                           website_url:
   *                             type: string
   *                           test_case_count:
   *                             type: number
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *                           updated_at:
   *                             type: string
   *                             format: date-time
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Internal server error
   */
  router.get('/projects', requireProjectView, testCasesController.getUserProjects);

  /**
   * @swagger
   * /api/v1/test-cases/projects/{projectId}:
   *   get:
   *     tags: [Test Cases]
   *     summary: Get test cases for a specific project
   *     description: Retrieve all test cases for a specific project owned by the authenticated user
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Project ID
   *     responses:
   *       200:
   *         description: Test cases retrieved successfully
   *       401:
   *         description: Authentication required
   *       404:
   *         description: Project not found
   *       500:
   *         description: Internal server error
   */
  router.get("/user-projects/:project-id", requireTestCaseView, validateProjectId, testCasesController.getProjectTestCases);

  return router;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     TestCase:
 *       type: object
 *       properties:
 *         testId:
 *           type: string
 *           description: Unique test case identifier
 *           example: "TC001"
 *         testDescription:
 *           type: string
 *           description: Detailed description of the test case
 *           example: "Verify successful login with valid credentials"
 *         testEndpoints:
 *           type: string
 *           description: API endpoints or URLs being tested
 *           example: "/api/auth/login, /dashboard"
 *         comments:
 *           type: string
 *           description: Expected results, preconditions, or notes
 *           example: "User should be redirected to dashboard after successful login"
 * 
 *     TestCaseGenerationRequest:
 *       type: object
 *       required:
 *         - websiteUrl
 *         - username
 *         - password
 *         - moduleFlow
 *       properties:
 *         websiteUrl:
 *           type: string
 *           format: url
 *           description: URL of the website to test
 *           example: "https://example.com"
 *         username:
 *           type: string
 *           description: Test username for the application
 *           example: "testuser"
 *         password:
 *           type: string
 *           description: Test password for the application
 *           example: "testpass123"
 *         moduleFlow:
 *           type: string
 *           description: Detailed description of the module flow to test
 *           minLength: 20
 *           example: "User login flow - Navigate to login page, enter credentials, click login button, verify successful login and dashboard access"
 *         additionalNotes:
 *           type: string
 *           description: Optional additional requirements or notes
 *           example: "Test on Chrome and Firefox browsers, check mobile responsiveness"
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
