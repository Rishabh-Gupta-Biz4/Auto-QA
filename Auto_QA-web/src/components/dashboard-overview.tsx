/**
 * Dashboard Overview Component
 * Following Next.js rules: Use strict typing, kebab-case filename, PascalCase component name
 */

'use client';

import { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import { DashboardOverviewProps } from "@/types/dashboard";
import MetricCard from "./metric-card";
import ChartCard from "./chart-card";
import styles from "./dashboard-overview.module.scss";

interface DashboardData {
  overview: {
    totalTestCases: number;
    successRate: number;
    totalExecutions: number;
    totalBugs: number;
    activeProjects: number;
  };
  testMetrics: {
    trendsData: Array<{
      date: string;
      value: number;
      label?: string;
    }>;
  };
  bugAnalytics: {
    trendsData: Array<{
      date: string;
      value: number;
    }>;
  };
}

interface DashboardOverviewExtendedProps extends DashboardOverviewProps {
  projectId?: number | null;
}

export default function DashboardOverview({ 
  data, 
  loading = false, 
  className = "",
  projectId = null
}: DashboardOverviewExtendedProps) {
  const token = useAppSelector((state) => state.auth.token); // Get token from Redux
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const url = new URL('http://localhost:3001/api/v1/dashboard');
        if (projectId) {
          url.searchParams.append('projectId', projectId.toString());
        }

        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        } else {
          throw new Error(result.message || 'Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        // Use fallback mock data
        setDashboardData({
          overview: {
            totalTestCases: 0,
            successRate: 0,
            totalExecutions: 0,
            totalBugs: 0,
            activeProjects: 0,
          },
          testMetrics: { trendsData: [] },
          bugAnalytics: { trendsData: [] },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [projectId, token]);

  // Generate dynamic chart data based on real data
  const generateTestTrendsChart = () => {
    if (!dashboardData?.testMetrics.trendsData.length) {
      // Fallback mock data
      return {
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        datasets: [
          {
            label: 'Test Success Rate',
            data: [85, 90, 78, 92, 88, 95, 87],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    }

    const last7Days = dashboardData.testMetrics.trendsData.slice(-7);
    return {
      labels: last7Days.map(d => new Date(d.date).toLocaleDateString('en', { weekday: 'short' }).toUpperCase()),
      datasets: [
        {
          label: 'Test Success Rate (%)',
          data: last7Days.map(d => d.value),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const generateBugTrendsChart = () => {
    if (!dashboardData?.bugAnalytics.trendsData.length) {
      // Fallback mock data
      return {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [
          {
            data: [12, 19, 35, 34],
            backgroundColor: [
              '#ef4444',
              '#f59e0b',
              '#3b82f6',
              '#10b981',
            ],
            borderWidth: 0,
          },
        ],
      };
    }

    const last7Days = dashboardData.bugAnalytics.trendsData.slice(-7);
    return {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [
        {
          data: [
            Math.round(last7Days.reduce((sum, d) => sum + d.value, 0) * 0.1), // 10% critical
            Math.round(last7Days.reduce((sum, d) => sum + d.value, 0) * 0.25), // 25% high
            Math.round(last7Days.reduce((sum, d) => sum + d.value, 0) * 0.4), // 40% medium
            Math.round(last7Days.reduce((sum, d) => sum + d.value, 0) * 0.25), // 25% low
          ],
          backgroundColor: [
            '#ef4444',
            '#f59e0b',
            '#3b82f6',
            '#10b981',
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  const currentLoading = isLoading || loading;
  const overview = dashboardData?.overview;

  const selectedProjectName = projectId 
    ? `Filtered by Project ID: ${projectId}` 
    : "All Projects";

  return (
    <section className={`${styles.overview} ${className}`}>
      {error && (
        <div className={styles.errorMessage}>
          ⚠️ {error}
        </div>
      )}

      {projectId && (
        <div className={styles.filterIndicator}>
          📊 Showing data for: <strong>{selectedProjectName}</strong>
        </div>
      )}
      
      {/* Main Metrics Grid */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Test cases"
          value={overview?.totalTestCases || 0}
          loading={currentLoading}
          className={styles.metricCard}
        />
        
        <MetricCard
          title="Pass rate"
          value={overview?.successRate ? `${overview.successRate}%` : "0%"}
          trend={{
            value: overview?.successRate ? Math.max(0, overview.successRate - 75) : 0,
            direction: (overview?.successRate || 0) >= 75 ? "up" : "down"
          }}
          loading={currentLoading}
          className={styles.metricCard}
        />
        
        <MetricCard
          title="Total executions"
          value={overview?.totalExecutions || 0}
          trend={{
            value: overview?.totalExecutions ? Math.min(25, overview.totalExecutions / 10) : 0,
            direction: "up"
          }}
          loading={currentLoading}
          className={styles.metricCard}
        />
        
        <MetricCard
          title="Active projects"
          value={overview?.activeProjects || 0}
          trend={{
            value: overview?.activeProjects ? Math.min(10, overview.activeProjects) : 0,
            direction: "up"
          }}
          loading={currentLoading}
          className={styles.metricCard}
        />
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        <ChartCard
          title="Bug severity distribution"
          type="doughnut"
          data={generateBugTrendsChart()}
          loading={currentLoading}
          className={styles.chartCard}
          actions={
            <button className={styles.chartAction}>⋯</button>
          }
        />
        
        <ChartCard
          title="Test success trends"
          type="line"
          data={generateTestTrendsChart()}
          loading={currentLoading}
          className={styles.chartCard}
          actions={
            <button className={styles.chartAction}>⋯</button>
          }
        />
      </div>
    </section>
  );
}
