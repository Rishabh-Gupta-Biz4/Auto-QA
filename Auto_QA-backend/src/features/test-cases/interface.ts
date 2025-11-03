/**
 * Test Cases Feature Interfaces
 * Following Node.js rules: Strict TypeScript interfaces for data structures
 */

/**
 * Request interface for test case generation
 */
export interface TestCaseGenerationRequest {
  websiteUrl: string;
  username: string; 
  password: string;
  moduleFlow: string;
  additionalNotes?: string;
}

/**
 * Interface for a generated test case
 */
export interface GeneratedTestCase {
  testId: string;
  testDescription: string;
  testEndpoints: string;
  comments: string;
}

/**
 * Request interface for saving test cases
 */
export interface SaveTestCasesRequest {
  projectData: TestCaseGenerationRequest;
  testCases: GeneratedTestCase[];
}

/**
 * Response interface for test case generation
 */
export interface TestCaseGenerationResponse {
  testCases: GeneratedTestCase[];
  metadata: {
    generatedCount: number;
    websiteUrl: string;
    serviceProvider: string;
    generatedAt: string;
  };
}

/**
 * Response interface for saving test cases
 */
export interface SaveTestCasesResponse {
  projectId: number;
  savedTestCases: number;
  testCases: Array<GeneratedTestCase & { id: number }>;
}

/**
 * Interface for project data from database
 */
export interface ProjectData {
  id: number;
  userId: number;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  updatedAt: Date;
  testCaseCount?: number;
}

/**
 * Interface for test case data from database
 */
export interface TestCaseData {
  id: number;
  projectId: number;
  testId: string;
  title: string;
  description: string;
  endpoints: string;
  comments: string;
  status: "draft" | "active" | "completed" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for OpenAI service status
 */
export interface OpenAIServiceStatus {
  available: boolean;
  provider: string;
}

/**
 * Interface for test generation history (analytics)
 */
export interface TestGenerationHistory {
  id?: number;
  userId: number;
  websiteUrl: string;
  moduleFlow: string;
  generatedCount: number;
  serviceProvider: string;
  createdAt: Date;
}

/**
 * Interface for API response structure
 * Following Node.js rules: Consistent API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

/**
 * Interface for paginated responses
 */
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
