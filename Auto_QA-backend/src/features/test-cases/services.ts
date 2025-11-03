/**
 * Test Cases Services Layer
 * Following Node.js rules: Separate business logic from controllers
 */

import { Pool, PoolConnection } from "mysql2/promise";
import { openAIService } from "../../services/openai.service";
import { logger } from "../../utils/logger";
import { TEST_CASES_MESSAGES } from "../../constants/test-cases-messages";
import {
  TestCaseGenerationRequest,
  GeneratedTestCase,
  SaveTestCasesRequest,
  TestCaseGenerationResponse,
  SaveTestCasesResponse,
  ProjectData,
  TestCaseData,
  TestGenerationHistory
} from "./interface";

export class TestCasesService {
  private db: Pool;

  constructor(database: Pool) {
    this.db = database;
  }

  /**
   * Generate test cases using AI service
   * Following Node.js rules: Business logic in services layer
   */
  public async generateTestCases(
    request: TestCaseGenerationRequest,
    userId: number
  ): Promise<TestCaseGenerationResponse> {
    try {
      logger.info("Starting test case generation", {
        userId,
        websiteUrl: request.websiteUrl,
        moduleFlowLength: request.moduleFlow.length
      });

      // Generate test cases using OpenAI service
      const testCases = await openAIService.generateTestCases(request);

      if (testCases.length === 0) {
        throw new Error("No test cases generated");
      }

      // Save generation history for analytics
      try {
        await this.saveGenerationHistory(userId, request, testCases.length);
      } catch (error) {
        logger.error("Failed to save generation history", {
          error: error instanceof Error ? error.message : String(error),
          userId,
          websiteUrl: request.websiteUrl
        });
      }

      const response: TestCaseGenerationResponse = {
        testCases,
        metadata: {
          generatedCount: testCases.length,
          websiteUrl: request.websiteUrl,
          serviceProvider: openAIService.getStatus().provider,
          generatedAt: new Date().toISOString()
        }
      };

      logger.info("Test case generation completed successfully", {
        userId,
        generatedCount: testCases.length,
        serviceProvider: openAIService.getStatus().provider
      });

      return response;

    } catch (error) {
      logger.error("Test case generation failed in service layer", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        websiteUrl: request.websiteUrl
      });
      throw error;
    }
  }

  /**
   * Save test cases to database
   * Following Node.js rules: Database operations in services layer
   */
  public async saveTestCases(
    request: SaveTestCasesRequest,
    userId: number
  ): Promise<SaveTestCasesResponse> {
    const connection = await this.db.getConnection();
    
    try {
      await connection.beginTransaction();

      logger.info("Starting test cases save operation", {
        userId,
        testCasesCount: request.testCases.length,
        websiteUrl: request.projectData.websiteUrl
      });

      // Create or update project
      const [projectResult] = await connection.execute(
        `INSERT INTO projects (created_by, name, description, base_url, created_at, updated_at) 
         VALUES (?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
         description = VALUES(description), base_url = VALUES(base_url), updated_at = NOW()`,
        [
          userId,
          `Quick Launch - ${new URL(request.projectData.websiteUrl).hostname}`,
          request.projectData.moduleFlow,
          request.projectData.websiteUrl
        ]
      );

      const projectId = (projectResult as any).insertId || (projectResult as any).id;

      // Save test cases
      const savedTestCases = [];
      for (const testCase of request.testCases) {
        const [testCaseResult] = await connection.execute(
          `INSERT INTO test_cases (project_id, test_id, title, description, endpoints, comments, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW())`,
          [
            projectId,
            testCase.testId,
            testCase.testDescription.substring(0, 100),
            testCase.testDescription,
            testCase.testEndpoints,
            testCase.comments
          ]
        );

        savedTestCases.push({
          id: (testCaseResult as any).insertId,
          ...testCase
        });
      }

      await connection.commit();

      logger.info("Test cases saved successfully", {
        userId,
        projectId,
        savedCount: savedTestCases.length
      });

      return {
        projectId,
        savedTestCases: savedTestCases.length,
        testCases: savedTestCases
      };

    } catch (error) {
      await connection.rollback();
      logger.error("Failed to save test cases in service layer", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        testCasesCount: request.testCases.length
      });
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get user projects
   * Following Node.js rules: Database queries in services layer
   */
  public async getUserProjects(userId: number): Promise<ProjectData[]> {
    try {
      logger.info("Retrieving user projects", { userId });

      const [projects] = await this.db.execute(
        `SELECT p.*, COUNT(tc.id) as test_case_count
         FROM projects p
         LEFT JOIN test_cases tc ON p.id = tc.project_id
         WHERE p.created_by = ?
         GROUP BY p.id
         ORDER BY p.updated_at DESC`,
        [userId]
      );

      logger.info("Projects retrieved successfully", {
        userId,
        projectCount: (projects as any[]).length
      });

      return projects as ProjectData[];

    } catch (error) {
      logger.error("Failed to retrieve user projects in service layer", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId
      });
      throw error;
    }
  }

  /**
   * Get test cases for a project
   * Following Node.js rules: Database queries in services layer
   */
  public async getProjectTestCases(projectId: number, userId: number): Promise<{
    project: ProjectData;
    testCases: TestCaseData[];
  }> {
    try {
      logger.info("Retrieving project test cases", { projectId, userId });

      // Verify project ownership
      const [projects] = await this.db.execute(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?",
        [projectId, userId]
      );

      if ((projects as any[]).length === 0) {
        throw new Error(TEST_CASES_MESSAGES.PROJECT_NOT_FOUND);
      }

      // Get test cases
      const [testCases] = await this.db.execute(
        "SELECT * FROM test_cases WHERE project_id = ? ORDER BY created_at DESC",
        [projectId]
      );

      logger.info("Project test cases retrieved successfully", {
        projectId,
        userId,
        testCasesCount: (testCases as any[]).length
      });

      return {
        project: (projects as any[])[0],
        testCases: testCases as TestCaseData[]
      };

    } catch (error) {
      logger.error("Failed to retrieve project test cases in service layer", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        projectId,
        userId
      });
      throw error;
    }
  }

  /**
   * Save generation history for analytics
   * Following Node.js rules: Private helper methods in services
   */
  private async saveGenerationHistory(
    userId: number,
    request: TestCaseGenerationRequest,
    generatedCount: number
  ): Promise<void> {
    try {
      await this.db.execute(
        `INSERT INTO test_generation_history (user_id, website_url, module_flow, generated_count, service_provider, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          request.websiteUrl,
          request.moduleFlow.substring(0, 500),
          generatedCount,
          openAIService.getStatus().provider
        ]
      );
    } catch (error) {
      // Don't throw here as this is optional tracking
      logger.warn("Could not save generation history", {
        error: error instanceof Error ? error.message : String(error),
        userId,
        websiteUrl: request.websiteUrl
      });
    }
  }
}

/**
 * Factory function to create TestCasesService instance
 * Following Node.js rules: Dependency injection pattern
 */
export const createTestCasesService = (database: Pool): TestCasesService => {
  return new TestCasesService(database);
};
