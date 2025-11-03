/**
 * Test Cases Feature Messages
 * Following Node.js rules: Centralized language/message files
 */

export const TEST_CASES_MESSAGES = {
  // Success messages
  GENERATION_SUCCESS: "Test cases generated successfully",
  SAVE_SUCCESS: "Test cases saved successfully",
  PROJECTS_RETRIEVED: "Projects retrieved successfully", 
  TEST_CASES_RETRIEVED: "Test cases retrieved successfully",
  OTP_VERIFIED: "OTP verified successfully. You can now set a new password.",

  // Error messages
  GENERATION_FAILED: "Failed to generate test cases",
  SAVE_FAILED: "Failed to save test cases",
  PROJECTS_RETRIEVAL_FAILED: "Failed to retrieve projects",
  TEST_CASES_RETRIEVAL_FAILED: "Failed to retrieve test cases",
  PROJECT_NOT_FOUND: "Project not found",
  
  // Validation messages
  WEBSITE_URL_REQUIRED: "Website URL is required",
  INVALID_URL_FORMAT: "Invalid website URL format",
  USERNAME_REQUIRED: "Username is required", 
  PASSWORD_REQUIRED: "Password is required",
  MODULE_FLOW_REQUIRED: "Module flow description is required",
  MODULE_FLOW_TOO_SHORT: "Please provide a more detailed flow description (at least 20 characters)",
  PROJECT_DATA_REQUIRED: "Project data and test cases are required",
  AUTHENTICATION_REQUIRED: "User authentication required",
  
  // Info messages
  HISTORY_SAVE_FAILED: "Failed to save generation history",
  USING_MOCK_DATA: "OpenAI API key not configured, test case generation will use mock data"
} as const;

export type TestCasesMessageKey = keyof typeof TEST_CASES_MESSAGES;
