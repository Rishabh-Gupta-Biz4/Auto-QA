/**
 * Dashboard types for frontend
 * Following Next.js rules: Use strict typing with interface or type for props and server data
 */

export interface DashboardOverview {
  totalProjects: number;
  activeProjects: number;
  totalTestCases: number;
  totalExecutions: number;
  totalBugs: number;
  recentExecutions: number;
  successRate: number;
}

export interface TestMetrics {
  totalExecutions: number;
  passedExecutions: number;
  failedExecutions: number;
  skippedExecutions: number;
  averageExecutionTime: number;
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
  status: "passed" | "failed" | "skipped";
  duration: number;
  executedAt: Date;
  bugCount?: number;
}

export interface RecentBug {
  id: number;
  title: string;
  projectName: string;
  severity: "critical" | "high" | "medium" | "low";
  bugType: "functional" | "ui" | "api" | "performance" | "security" | "accessibility" | "usability";
  endpoint: string;
  reportedAt: Date;
}

export interface RecentProject {
  id: number;
  name: string;
  status: "active" | "inactive";
  lastExecutionAt?: Date;
  totalTestCases: number;
  successRate: number;
  bugCount: number;
}

export interface ProjectHealth {
  projectId: number;
  projectName: string;
  healthScore: number;
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

export interface DashboardQuery {
  timeframe?: "today" | "week" | "month" | "quarter" | "year" | "custom";
  startDate?: string;
  endDate?: string;
  projectId?: number;
  includeInactive?: boolean;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Component props interfaces
 */
export interface DashboardOverviewProps {
  data?: DashboardOverview | null;
  loading?: boolean;
  className?: string;
}

export interface TestMetricsProps {
  data: TestMetrics;
  loading?: boolean;
  className?: string;
}

export interface BugAnalyticsProps {
  data: BugAnalytics;
  loading?: boolean;
  className?: string;
}

export interface RecentActivityProps {
  data: RecentActivity;
  loading?: boolean;
  className?: string;
}

export interface ProjectHealthProps {
  data: ProjectHealth[];
  loading?: boolean;
  className?: string;
}

export interface ChartProps {
  data: TrendData[];
  title: string;
  type?: "line" | "bar" | "doughnut" | "pie";
  height?: number;
  className?: string;
}

export interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  className?: string;
}

export interface LoadingProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export interface ErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Filter and pagination interfaces
 */
export interface DashboardFilters {
  timeframe: string;
  projectId?: number;
  startDate?: string;
  endDate?: string;
}

export interface FilterProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  projects: Array<{ id: number; name: string }>;
  className?: string;
}
