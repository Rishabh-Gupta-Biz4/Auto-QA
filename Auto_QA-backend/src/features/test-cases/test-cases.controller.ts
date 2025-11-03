/**
 * Test Cases Controller
 * Following Node.js rules: Feature-based controller with proper error handling and logging
 * Handles HTTP concerns only, delegates business logic to services layer
 */

import { Request, Response } from "express";
import { Pool } from "mysql2/promise";
import { ResponseHandler } from "../../utils/response";
import { logger } from "../../utils/logger";
import { AuthRequest } from "../../middleware/auth";
import { TEST_CASES_MESSAGES } from "../../constants/test-cases-messages";
import { createTestCasesService } from "./services";
import { TestExecutionService } from "./test-execution.service";
import { 
  TestCaseGenerationRequest,
  SaveTestCasesRequest
} from "./interface";

export class TestCasesController {
  private db: Pool;
  private testCasesService: ReturnType<typeof createTestCasesService>;
  private testExecutionService: TestExecutionService;

  constructor(database: Pool) {
    this.db = database;
    this.testCasesService = createTestCasesService(database);
    this.testExecutionService = new TestExecutionService(database);
  }

  /**
   * Generate test cases using AI based on user input
   * Following Node.js rules: Controller handles HTTP concerns only
   */
  public generateTestCases = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;
      
      if (!userId) {
        ResponseHandler.unauthorized(res, TEST_CASES_MESSAGES.AUTHENTICATION_REQUIRED);
        return;
      }

      const generationRequest: TestCaseGenerationRequest = req.body;
      
      const result = await this.testCasesService.generateTestCases(generationRequest, userId);
      
      ResponseHandler.success(res, TEST_CASES_MESSAGES.GENERATION_SUCCESS, result);

    } catch (error) {
      const authReq = req as AuthRequest;
      logger.error("Test case generation error in controller", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: authReq.user?.userId,
        timestamp: new Date().toISOString()
      });
      ResponseHandler.internalError(res, TEST_CASES_MESSAGES.GENERATION_FAILED);
    }
  };

  /**
   * Save generated test cases to database
   * Following Node.js rules: Controller handles HTTP concerns only
   */
  public saveTestCases = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        ResponseHandler.unauthorized(res, TEST_CASES_MESSAGES.AUTHENTICATION_REQUIRED);
        return;
      }

      const saveRequest: SaveTestCasesRequest = req.body;
      
      const result = await this.testCasesService.saveTestCases(saveRequest, userId);
      
      ResponseHandler.success(res, TEST_CASES_MESSAGES.SAVE_SUCCESS, result);

    } catch (error) {
      const authReq = req as AuthRequest;
      logger.error("Save test cases error in controller", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: authReq.user?.userId,
        timestamp: new Date().toISOString()
      });
      ResponseHandler.internalError(res, TEST_CASES_MESSAGES.SAVE_FAILED);
    }
  };

  /**
   * Get user's test case projects
   * Following Node.js rules: Controller handles HTTP concerns only
   */
  public getUserProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        ResponseHandler.unauthorized(res, TEST_CASES_MESSAGES.AUTHENTICATION_REQUIRED);
        return;
      }

      const result = await this.testCasesService.getUserProjects(userId);
      
      ResponseHandler.success(res, TEST_CASES_MESSAGES.PROJECTS_RETRIEVED, {
        projects: result
      });

    } catch (error) {
      const authReq = req as AuthRequest;
      logger.error("Get user projects error in controller", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: authReq.user?.userId,
        timestamp: new Date().toISOString()
      });
      ResponseHandler.internalError(res, TEST_CASES_MESSAGES.PROJECTS_RETRIEVAL_FAILED);
    }
  };

  /**
   * Get test cases for a specific project
   * Following Node.js rules: Controller handles HTTP concerns only
   */
  public getProjectTestCases = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const { projectId } = req.params;
      const userId = authReq.user?.userId;

      if (!userId) {
        ResponseHandler.unauthorized(res, TEST_CASES_MESSAGES.AUTHENTICATION_REQUIRED);
        return;
      }

      const result = await this.testCasesService.getProjectTestCases(
        parseInt(projectId, 10),
        userId
      );
      
      ResponseHandler.success(res, TEST_CASES_MESSAGES.TEST_CASES_RETRIEVED, result);

    } catch (error) {
      if (error instanceof Error && error.message === TEST_CASES_MESSAGES.PROJECT_NOT_FOUND) {
        ResponseHandler.notFound(res, TEST_CASES_MESSAGES.PROJECT_NOT_FOUND);
        return;
      }

      const authReq = req as AuthRequest;
      logger.error("Get project test cases error in controller", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: authReq.user?.userId,
        projectId: req.params?.projectId,
        timestamp: new Date().toISOString()
      });
      ResponseHandler.internalError(res, TEST_CASES_MESSAGES.TEST_CASES_RETRIEVAL_FAILED);
    }
  };

  /**
   * Execute test cases automatically using provided credentials
   * Following Node.js rules: Async/await, proper error handling, detailed logging
   */
  public executeTestCases = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      logger.info("Execute test cases request received", {
        userId: authReq.user?.userId,
        websiteUrl: req.body.websiteUrl,
        testCaseCount: req.body.testCases?.length
      });

      if (!authReq.user?.userId) {
        ResponseHandler.unauthorized(res, "User authentication required");
        return;
      }

      const executionRequest = {
        websiteUrl: req.body.websiteUrl,
        username: req.body.username,
        password: req.body.password,
        testCases: req.body.testCases,
        projectName: req.body.projectName,
        moduleFlow: req.body.moduleFlow,
        additionalNotes: req.body.additionalNotes
      };

      const executionResults = await this.testExecutionService.executeTestCases(
        executionRequest,
        authReq.user.userId
      );

      logger.info("Test cases executed successfully", {
        userId: authReq.user.userId,
        projectId: executionResults.projectId,
        executionId: executionResults.executionId,
        summary: executionResults.summary
      });

      ResponseHandler.success(res, "Test cases executed successfully", {
        projectId: executionResults.projectId,
        executionId: executionResults.executionId,
        summary: executionResults.summary,
        results: executionResults.results.slice(0, 10), // Limit response size
        totalResults: executionResults.results.length
      });

    } catch (error) {
      const authReq = req as AuthRequest;
      logger.error("Execute test cases error in controller", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: authReq.user?.userId
      });
      ResponseHandler.internalError(res, "Failed to execute test cases");
    }
  };
}

/**
 * Factory function to create TestCasesController instance
 * Following Node.js rules: Dependency injection pattern
 */
export const createTestCasesController = (database: Pool): TestCasesController => {
  return new TestCasesController(database);
};