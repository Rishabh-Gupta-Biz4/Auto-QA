import { DatabaseUtils } from '@/utils/database';
import { logger } from '@/utils/logger';
import { 
  DashboardData, 
  DashboardOverview, 
  TestMetrics, 
  BugAnalytics, 
  RecentActivity,
  ProjectHealth,
  DashboardQuery,
  TrendData,
  IDashboardService
} from './interface';
import { RowDataPacket } from 'mysql2';

export class DashboardService implements IDashboardService {
  
  /**
   * Get complete dashboard data with metrics, analytics, and activity
   * @param query - Dashboard query parameters including timeframe and filters
   * @returns Promise<DashboardData> - Complete dashboard data object
   * @throws Error when database operations fail
   */
  async getDashboardData(query: DashboardQuery): Promise<DashboardData> {
    try {
      logger.info("Fetching complete dashboard data", { query });
    const { startDate, endDate } = this.getDateRange(query.timeframe, query.startDate, query.endDate);
    
    const [overview, testMetrics, bugAnalytics, recentActivity, projectHealth] = await Promise.all([
      this.getOverview(startDate, endDate, query.projectId),
      this.getTestMetrics(startDate, endDate, query.projectId),
      this.getBugAnalytics(startDate, endDate, query.projectId),
      this.getRecentActivity(query.projectId),
      this.getProjectHealth(startDate, endDate)
    ]);

      logger.info("Successfully retrieved complete dashboard data");
      return {
        overview,
        testMetrics,
        bugAnalytics,
        recentActivity,
        projectHealth
      };
    } catch (error) {
      logger.error("Failed to fetch dashboard data", { error, query });
      throw error;
    }
  }

  /**
   * Get dashboard overview statistics
   */
  async getOverview(startDate: Date, endDate: Date, projectId?: number): Promise<DashboardOverview> {
    const projectFilter = projectId ? 'WHERE id = ?' : '';
    const projectParams = projectId ? [projectId] : [];

    const [
      projectStats,
      testCaseStats,
      executionStats,
      bugStats,
      recentExecutionStats,
      successRateStats
    ] = await Promise.all([
      // Project statistics
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
         FROM projects ${projectFilter}`,
        projectParams
      ),
      
      // Test case statistics
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM test_cases tc 
         ${projectId ? 'WHERE tc.project_id = ?' : ''}`,
        projectParams
      ),
      
      // Execution statistics
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM test_executions te 
         WHERE te.start_time BETWEEN ? AND ? 
         ${projectId ? 'AND te.project_id = ?' : ''}`,
        projectId ? [startDate, endDate, projectId] : [startDate, endDate]
      ),
      
      // Bug statistics
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM bug_reports br 
         WHERE br.created_at BETWEEN ? AND ? 
         ${projectId ? 'AND br.project_id = ?' : ''}`,
        projectId ? [startDate, endDate, projectId] : [startDate, endDate]
      ),
      
      // Recent executions (last 24 hours)
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT COUNT(*) as recent FROM test_executions te 
         WHERE te.start_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
         ${projectId ? 'AND te.project_id = ?' : ''}`,
        projectParams
      ),
      
      // Success rate
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed
         FROM test_executions te 
         WHERE te.start_time BETWEEN ? AND ?
         ${projectId ? 'AND te.project_id = ?' : ''}`,
        projectId ? [startDate, endDate, projectId] : [startDate, endDate]
      )
    ]);

    const successRate = successRateStats[0]?.total > 0 
      ? Math.round((successRateStats[0]?.passed / successRateStats[0]?.total) * 100)
      : 0;

    return {
      totalProjects: projectStats[0]?.total || 0,
      activeProjects: projectStats[0]?.active || 0,
      totalTestCases: testCaseStats[0]?.total || 0,
      totalExecutions: executionStats[0]?.total || 0,
      totalBugs: bugStats[0]?.total || 0,
      recentExecutions: recentExecutionStats[0]?.recent || 0,
      successRate
    };
  }

  /**
   * Get test execution metrics
   */
  async getTestMetrics(startDate: Date, endDate: Date, projectId?: number): Promise<TestMetrics> {
    const projectParams = projectId ? [startDate, endDate, projectId] : [startDate, endDate];
    
    const [executionStats, trendsData] = await Promise.all([
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped,
          AVG(duration) as avgDuration
         FROM test_executions 
         WHERE start_time BETWEEN ? AND ?
         ${projectId ? 'AND project_id = ?' : ''}`,
        projectParams
      ),
      
      this.getExecutionTrends(startDate, endDate, projectId)
    ]);

    const stats = executionStats[0];
    const total = stats?.total || 0;
    const passed = stats?.passed || 0;
    
    return {
      totalExecutions: total,
      passedExecutions: passed,
      failedExecutions: stats?.failed || 0,
      skippedExecutions: stats?.skipped || 0,
      averageExecutionTime: Math.round(stats?.avgDuration || 0),
      successRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      trendsData
    };
  }

  /**
   * Get bug analytics
   */
  async getBugAnalytics(startDate: Date, endDate: Date, projectId?: number): Promise<BugAnalytics> {
    const projectParams = projectId ? [startDate, endDate, projectId] : [startDate, endDate];
    
    const [totalBugs, severityStats, typeStats, statusStats, trendsData] = await Promise.all([
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM bug_reports 
         WHERE created_at BETWEEN ? AND ?
         ${projectId ? 'AND project_id = ?' : ''}`,
        projectParams
      ),
      
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT severity, COUNT(*) as count FROM bug_reports 
         WHERE created_at BETWEEN ? AND ?
         ${projectId ? 'AND project_id = ?' : ''}
         GROUP BY severity`,
        projectParams
      ),
      
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT bug_type, COUNT(*) as count FROM bug_reports 
         WHERE created_at BETWEEN ? AND ?
         ${projectId ? 'AND project_id = ?' : ''}
         GROUP BY bug_type`,
        projectParams
      ),
      
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT status, COUNT(*) as count FROM bug_reports 
         WHERE created_at BETWEEN ? AND ?
         ${projectId ? 'AND project_id = ?' : ''}
         GROUP BY status`,
        projectParams
      ),
      
      this.getBugTrends(startDate, endDate, projectId)
    ]);

    return {
      totalBugs: totalBugs[0]?.total || 0,
      bugsBySeverity: this.aggregateByKey(severityStats, ['critical', 'high', 'medium', 'low']),
      bugsByType: this.aggregateByKey(typeStats, ['functional', 'ui', 'api', 'performance', 'security', 'accessibility', 'usability']),
      bugsByStatus: this.aggregateByKey(statusStats, ['open', 'in-progress', 'resolved', 'closed', 'rejected']),
      trendsData
    };
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(projectId?: number): Promise<RecentActivity> {
    const projectFilter = projectId ? 'AND te.project_id = ?' : '';
    const bugProjectFilter = projectId ? 'AND br.project_id = ?' : '';
    const projectProjectFilter = projectId ? 'WHERE p.id = ?' : '';
    const params = projectId ? [projectId] : [];

    const [recentExecutions, recentBugs, recentProjects] = await Promise.all([
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT 
          te.id, tc.title as testCaseTitle, p.name as projectName,
          te.status, te.duration, te.start_time as executedAt,
          (SELECT COUNT(*) FROM bug_reports WHERE test_execution_id = te.id) as bugCount
         FROM test_executions te
         JOIN test_cases tc ON te.test_case_id = tc.id
         JOIN projects p ON te.project_id = p.id
         WHERE te.start_time >= DATE_SUB(NOW(), INTERVAL 7 DAY) ${projectFilter}
         ORDER BY te.start_time DESC
         LIMIT 10`,
        params
      ),
      
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT 
          br.id, br.title, p.name as projectName, br.severity,
          br.bug_type, br.endpoint, br.created_at as reportedAt
         FROM bug_reports br
         JOIN projects p ON br.project_id = p.id
         WHERE br.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) ${bugProjectFilter}
         ORDER BY br.created_at DESC
         LIMIT 10`,
        params
      ),
      
      DatabaseUtils.executeQuery<RowDataPacket[]>(
        `SELECT 
          p.id, p.name, p.status,
          (SELECT MAX(start_time) FROM test_executions WHERE project_id = p.id) as lastExecutionAt,
          (SELECT COUNT(*) FROM test_cases WHERE project_id = p.id) as totalTestCases,
          (SELECT COUNT(*) FROM bug_reports WHERE project_id = p.id AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as bugCount
         FROM projects p
         ${projectProjectFilter}
         ORDER BY p.updated_at DESC
         LIMIT 5`,
        params
      )
    ]);

    return {
      recentExecutions: recentExecutions.map(row => ({
        id: row.id,
        testCaseTitle: row.testCaseTitle,
        projectName: row.projectName,
        status: row.status,
        duration: row.duration || 0,
        executedAt: new Date(row.executedAt),
        bugCount: row.bugCount || 0
      })),
      recentBugs: recentBugs.map(row => ({
        id: row.id,
        title: row.title,
        projectName: row.projectName,
        severity: row.severity,
        bugType: row.bug_type,
        endpoint: row.endpoint,
        reportedAt: new Date(row.reportedAt)
      })),
      recentProjects: recentProjects.map(row => ({
        id: row.id,
        name: row.name,
        status: row.status,
        lastExecutionAt: row.lastExecutionAt ? new Date(row.lastExecutionAt) : undefined,
        totalTestCases: row.totalTestCases || 0,
        successRate: 85, // TODO: Calculate actual success rate
        bugCount: row.bugCount || 0
      }))
    };
  }

  /**
   * Get project health metrics
   */
  async getProjectHealth(startDate: Date, endDate: Date): Promise<ProjectHealth[]> {
    const projects = await DatabaseUtils.executeQuery<RowDataPacket[]>(
      `SELECT 
        p.id, p.name,
        (SELECT COUNT(*) FROM test_cases WHERE project_id = p.id) as totalTestCases,
        (SELECT COUNT(*) FROM test_executions WHERE project_id = p.id AND status = 'passed' AND start_time BETWEEN ? AND ?) as passedTests,
        (SELECT COUNT(*) FROM test_executions WHERE project_id = p.id AND status = 'failed' AND start_time BETWEEN ? AND ?) as failedTests,
        (SELECT COUNT(*) FROM bug_reports WHERE project_id = p.id AND severity = 'critical' AND created_at BETWEEN ? AND ?) as criticalBugs,
        (SELECT MAX(start_time) FROM test_executions WHERE project_id = p.id) as lastExecutionAt
       FROM projects p
       WHERE p.status = 'active'
       ORDER BY p.name`,
      [startDate, endDate, startDate, endDate, startDate, endDate]
    );

    return projects.map(row => {
      const totalTests = (row.passedTests || 0) + (row.failedTests || 0);
      const successRate = totalTests > 0 ? Math.round((row.passedTests / totalTests) * 100) : 0;
      const healthScore = this.calculateHealthScore(successRate, row.criticalBugs, row.lastExecutionAt);

      return {
        projectId: row.id,
        projectName: row.name,
        healthScore,
        totalTestCases: row.totalTestCases || 0,
        passedTests: row.passedTests || 0,
        failedTests: row.failedTests || 0,
        criticalBugs: row.criticalBugs || 0,
        lastExecutionAt: row.lastExecutionAt ? new Date(row.lastExecutionAt) : undefined,
        trendsData: [] // TODO: Implement project-specific trends
      };
    });
  }

  /**
   * Helper methods
   */
  private getDateRange(timeframe?: string, startDate?: string, endDate?: string): { startDate: Date; endDate: Date } {
    const end = endDate ? new Date(endDate) : new Date();
    let start: Date;

    switch (timeframe) {
      case 'today':
        start = new Date();
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start = new Date();
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start = new Date();
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    }

    return { startDate: start, endDate: end };
  }

  private async getExecutionTrends(startDate: Date, endDate: Date, projectId?: number): Promise<TrendData[]> {
    const params = projectId ? [startDate, endDate, projectId] : [startDate, endDate];
    
    const trends = await DatabaseUtils.executeQuery<RowDataPacket[]>(
      `SELECT 
        DATE(start_time) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed
       FROM test_executions 
       WHERE start_time BETWEEN ? AND ?
       ${projectId ? 'AND project_id = ?' : ''}
       GROUP BY DATE(start_time)
       ORDER BY date`,
      params
    );

    return trends.map(row => ({
      date: row.date,
      value: row.total > 0 ? Math.round((row.passed / row.total) * 100) : 0,
      label: `${row.passed}/${row.total}`
    }));
  }

  private async getBugTrends(startDate: Date, endDate: Date, projectId?: number): Promise<TrendData[]> {
    const params = projectId ? [startDate, endDate, projectId] : [startDate, endDate];
    
    const trends = await DatabaseUtils.executeQuery<RowDataPacket[]>(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as value
       FROM bug_reports 
       WHERE created_at BETWEEN ? AND ?
       ${projectId ? 'AND project_id = ?' : ''}
       GROUP BY DATE(created_at)
       ORDER BY date`,
      params
    );

    return trends.map(row => ({
      date: row.date,
      value: row.value
    }));
  }

  private aggregateByKey(data: RowDataPacket[], keys: string[]): any {
    const result: any = {};
    
    // Initialize all keys with 0
    keys.forEach(key => {
      result[key.replace('-', '')] = 0; // Handle 'in-progress' -> 'inProgress'
    });

    // Aggregate data
    data.forEach(row => {
      const key = row[Object.keys(row)[0]]; // First column (severity, bug_type, status)
      const normalizedKey = key.replace('-', ''); // Handle 'in-progress' -> 'inProgress'
      if (keys.includes(key)) {
        result[normalizedKey] = row.count || 0;
      }
    });

    return result;
  }

  private calculateHealthScore(successRate: number, criticalBugs: number, lastExecutionAt?: Date): number {
    let score = successRate; // Start with success rate (0-100)

    // Deduct points for critical bugs
    score -= Math.min(criticalBugs * 10, 50); // Max 50 points deduction

    // Deduct points for stale projects
    if (lastExecutionAt) {
      const daysSinceLastExecution = Math.floor((Date.now() - lastExecutionAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastExecution > 7) {
        score -= Math.min(daysSinceLastExecution - 7, 30); // Max 30 points deduction
      }
    } else {
      score -= 30; // No executions ever
    }

    return Math.max(0, Math.min(100, score)); // Clamp between 0-100
  }
}
