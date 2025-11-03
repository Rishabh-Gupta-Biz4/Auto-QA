export interface DashboardOverview {
  totalProjects: number;
  activeProjects: number;
  totalTestCases: number;
  totalExecutions: number;
  totalBugs: number;
  recentExecutions: number; // Last 24 hours
  successRate: number; // Percentage
}

export interface TestMetrics {
  totalExecutions: number;
  passedExecutions: number;
  failedExecutions: number;
  skippedExecutions: number;
  averageExecutionTime: number; // in seconds
  successRate: number;
  trendsData: TrendData[];
}

export interface BugAnalytics {
  totalBugs: number;
  bugsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  bugsByType: {
    functional: number;
    ui: number;
    api: number;
    performance: number;
    security: number;
    accessibility: number;
    usability: number;
  };
  bugsByStatus: {
    open: number;
    inprogress: number;
    resolved: number;
    closed: number;
    rejected: number;
  };
  trendsData: TrendData[];
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface RecentActivity {
  recentExecutions: RecentExecution[];
  recentBugs: RecentBug[];
  recentProjects: RecentProject[];
}

export interface RecentExecution {
  id: number;
  testCaseTitle: string;
  projectName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  executedAt: Date;
  bugCount?: number;
}

export interface RecentBug {
  id: number;
  title: string;
  projectName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  bugType: 'functional' | 'ui' | 'api' | 'performance' | 'security' | 'accessibility' | 'usability';
  endpoint: string;
  reportedAt: Date;
}

export interface RecentProject {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  lastExecutionAt?: Date;
  totalTestCases: number;
  successRate: number;
  bugCount: number;
}

export interface ProjectHealth {
  projectId: number;
  projectName: string;
  healthScore: number; // 0-100
  totalTestCases: number;
  passedTests: number;
  failedTests: number;
  criticalBugs: number;
  lastExecutionAt?: Date;
  trendsData: TrendData[];
}

export interface DashboardData {
  overview: DashboardOverview;
  testMetrics: TestMetrics;
  bugAnalytics: BugAnalytics;
  recentActivity: RecentActivity;
  projectHealth: ProjectHealth[];
}

export interface DashboardFilters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  projectIds?: number[];
  testTypes?: string[];
  severities?: string[];
}

export interface DashboardQuery {
  timeframe?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  projectId?: number;
  includeInactive?: boolean;
}
