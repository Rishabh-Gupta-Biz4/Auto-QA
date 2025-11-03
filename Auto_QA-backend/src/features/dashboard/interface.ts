/**
 * Dashboard feature interfaces
 * Following Node.js rules: Define strict TypeScript interfaces/models for data structures
 */

// Re-export dashboard types for feature-specific access
export {
  DashboardData,
  DashboardOverview,
  TestMetrics,
  BugAnalytics,
  RecentActivity,
  ProjectHealth,
  DashboardQuery,
  DashboardFilters,
  TrendData,
  RecentExecution,
  RecentBug,
  RecentProject
} from '@/types/dashboard';

// Import for interface definitions
import { Request } from 'express';
import { 
  DashboardData,
  DashboardOverview,
  TestMetrics,
  BugAnalytics,
  RecentActivity,
  ProjectHealth,
  DashboardQuery
} from '@/types/dashboard';

/**
 * Dashboard service method responses
 */
export interface IDashboardService {
  getDashboardData(query: DashboardQuery): Promise<DashboardData>;
  getOverview(startDate: Date, endDate: Date, projectId?: number): Promise<DashboardOverview>;
  getTestMetrics(startDate: Date, endDate: Date, projectId?: number): Promise<TestMetrics>;
  getBugAnalytics(startDate: Date, endDate: Date, projectId?: number): Promise<BugAnalytics>;
  getRecentActivity(projectId?: number): Promise<RecentActivity>;
  getProjectHealth(startDate: Date, endDate: Date): Promise<ProjectHealth[]>;
}

/**
/**
/**
 * Dashboard controller request/response interfaces
 */
export interface DashboardRequest extends Request {
  query: Record<string, any> & DashboardQuery;
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export interface DashboardExportRequest {
  format: 'csv' | 'pdf';
  timeframe?: string;
  startDate?: string;
  endDate?: string;
  projectId?: number;
  sections?: string[];
  includeCharts?: boolean;
  fileName?: string;
}

export interface DashboardExportResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  generatedAt: Date;
  expiresAt: Date;
}

/**
 * Database query result interfaces
 */
export interface ProjectStatsRow {
  total: number;
  active: number;
}

export interface ExecutionStatsRow {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  avgDuration: number;
}

export interface BugStatsRow {
  severity?: string;
  bug_type?: string;
  status?: string;
  count: number;
}

export interface TrendDataRow {
  date: string;
  total: number;
  passed: number;
  value: number;
  label?: string;
}

export interface RecentExecutionRow {
  id: number;
  testCaseTitle: string;
  projectName: string;
  status: string;
  duration: number;
  executedAt: string;
  bugCount: number;
}

export interface RecentBugRow {
  id: number;
  title: string;
  projectName: string;
  severity: string;
  bug_type: string;
  endpoint: string;
  reportedAt: string;
}

export interface RecentProjectRow {
  id: number;
  name: string;
  status: string;
  lastExecutionAt: string;
  totalTestCases: number;
  bugCount: number;
}

export interface ProjectHealthRow {
  id: number;
  name: string;
  totalTestCases: number;
  passedTests: number;
  failedTests: number;
  criticalBugs: number;
  lastExecutionAt: string;
}

/**
 * Internal service helper interfaces
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface HealthScoreFactors {
  successRate: number;
  criticalBugs: number;
  lastExecutionAt?: Date;
  totalTests: number;
  activeBugs: number;
}

export interface AggregationResult {
  [key: string]: number;
}

/**
 * Error handling interfaces
 */
export interface DashboardError extends Error {
  code?: string;
  statusCode?: number;
  context?: {
    query?: DashboardQuery;
    projectId?: number;
    timeframe?: string;
  };
}

/**
 * Cache interfaces (if implementing caching)
 */
export interface CacheKey {
  prefix: string;
  query: DashboardQuery;
  timestamp: number;
}

export interface CachedDashboardData {
  data: DashboardData;
  cachedAt: Date;
  expiresAt: Date;
  cacheKey: string;
}
