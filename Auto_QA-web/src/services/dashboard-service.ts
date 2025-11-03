/**
 * Dashboard service for API calls
 * Following Next.js rules: Clean, modular, and scalable code
 */

import { apiClient } from "./api-client";
import { 
  DashboardData, 
  DashboardOverview, 
  TestMetrics, 
  BugAnalytics, 
  RecentActivity, 
  ProjectHealth, 
  DashboardQuery,
  ApiResponse 
} from "@/types/dashboard";

class DashboardService {
  private readonly baseEndpoint = "/api/v1/dashboard";

  /**
   * Convert DashboardQuery to API-compatible params
   */
  private convertQueryToParams(query: DashboardQuery): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    
    if (query.timeframe) params.timeframe = query.timeframe;
    if (query.startDate) params.startDate = query.startDate;
    if (query.endDate) params.endDate = query.endDate;
    if (query.projectId !== undefined) params.projectId = query.projectId;
    if (query.includeInactive !== undefined) params.includeInactive = query.includeInactive;
    
    return params;
  }

  /**
   * Get complete dashboard data
   */
  async getDashboardData(query?: DashboardQuery): Promise<DashboardData> {
    const params = query ? this.convertQueryToParams(query) : undefined;
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      this.baseEndpoint,
      params
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch dashboard data");
    }
    
    return response.data;
  }

  /**
   * Get dashboard overview statistics
   */
  async getOverview(query?: DashboardQuery): Promise<DashboardOverview> {
    const params = query ? this.convertQueryToParams(query) : undefined;
    const response = await apiClient.get<ApiResponse<DashboardOverview>>(
      `${this.baseEndpoint}/overview`,
      params
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch overview data");
    }
    
    return response.data;
  }

  /**
   * Get test execution metrics
   */
  async getTestMetrics(query?: DashboardQuery): Promise<TestMetrics> {
    const params = query ? this.convertQueryToParams(query) : undefined;
    const response = await apiClient.get<ApiResponse<TestMetrics>>(
      `${this.baseEndpoint}/test-metrics`,
      params
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch test metrics");
    }
    
    return response.data;
  }

  /**
   * Get bug analytics
   */
  async getBugAnalytics(query?: DashboardQuery): Promise<BugAnalytics> {
    const params = query ? this.convertQueryToParams(query) : undefined;
    const response = await apiClient.get<ApiResponse<BugAnalytics>>(
      `${this.baseEndpoint}/bug-analytics`,
      params
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch bug analytics");
    }
    
    return response.data;
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(query?: DashboardQuery): Promise<RecentActivity> {
    const params = query ? this.convertQueryToParams(query) : undefined;
    const response = await apiClient.get<ApiResponse<RecentActivity>>(
      `${this.baseEndpoint}/recent-activity`,
      params
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch recent activity");
    }
    
    return response.data;
  }

  /**
   * Get project health metrics
   */
  async getProjectHealth(query?: DashboardQuery): Promise<ProjectHealth[]> {
    const params = query ? this.convertQueryToParams(query) : undefined;
    const response = await apiClient.get<ApiResponse<ProjectHealth[]>>(
      `${this.baseEndpoint}/project-health`,
      params
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch project health");
    }
    
    return response.data;
  }

  /**
   * Export dashboard data
   */
  async exportDashboard(exportData: {
    format: "csv" | "pdf";
    timeframe?: string;
    startDate?: string;
    endDate?: string;
    projectId?: number;
    sections?: string[];
  }): Promise<{ downloadUrl: string; fileName: string; fileSize: number }> {
    const response = await apiClient.post<ApiResponse<{
      downloadUrl: string;
      fileName: string;
      fileSize: number;
    }>>(
      `${this.baseEndpoint}/export`,
      exportData
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to export dashboard data");
    }
    
    return response.data;
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;
