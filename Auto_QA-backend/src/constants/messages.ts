/**
 * Centralized message constants for the application
 * Following Node.js rules: Avoid hardcoding messages
 */

export const MESSAGES = {
  // Dashboard messages
  DASHBOARD: {
    FETCH_SUCCESS: "Dashboard data retrieved successfully",
    OVERVIEW_SUCCESS: "Overview statistics retrieved successfully", 
    TEST_METRICS_SUCCESS: "Test metrics retrieved successfully",
    BUG_ANALYTICS_SUCCESS: "Bug analytics retrieved successfully",
    RECENT_ACTIVITY_SUCCESS: "Recent activity retrieved successfully",
    PROJECT_HEALTH_SUCCESS: "Project health metrics retrieved successfully",
    EXPORT_SUCCESS: "Dashboard export initiated successfully",
    FETCH_ERROR: "Failed to fetch dashboard data",
    OVERVIEW_ERROR: "Failed to fetch overview statistics",
    TEST_METRICS_ERROR: "Failed to fetch test metrics",
    BUG_ANALYTICS_ERROR: "Failed to fetch bug analytics",
    RECENT_ACTIVITY_ERROR: "Failed to fetch recent activity",
    PROJECT_HEALTH_ERROR: "Failed to fetch project health metrics"
  },

  // Authentication messages
  AUTH: {
    TOKEN_MISSING: "Access denied. No token provided.",
    TOKEN_INVALID: "Invalid token.",
    TOKEN_EXPIRED: "Token expired.",
    INSUFFICIENT_PERMISSIONS: "Access denied. Insufficient permissions.",
    USER_NOT_AUTHENTICATED: "Access denied. User not authenticated."
  },

  // General API messages
  API: {
    ROUTE_NOT_FOUND: "Route not found",
    SERVER_ERROR: "Server Error",
    VALIDATION_ERROR: "Validation error",
    TOO_MANY_REQUESTS: "Too many requests, please try again later."
  },

  // Database messages
  DATABASE: {
    CONNECTION_SUCCESS: "Database connected successfully",
    CONNECTION_FAILED: "Database connection failed",
    MIGRATION_SUCCESS: "Migration completed successfully",
    MIGRATION_FAILED: "Migration failed",
    QUERY_ERROR: "Database query error"
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;
