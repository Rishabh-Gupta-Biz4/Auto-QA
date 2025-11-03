'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useAppSelector } from "@/redux/hooks";
import DashboardLayout from "@/components/dashboard-layout";
import DashboardOverview from "@/components/dashboard-overview";
import styles from "./dashboard.module.scss";

interface Project {
  id: number;
  name: string;
  status: string;
  testCaseCount: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const token = useAppSelector((state) => state.auth.token); // Get token from Redux
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Fetch projects for the dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      if (!isAuthenticated) return;
      
      try {
        setProjectsLoading(true);
        
        if (!token) return;

        const response = await fetch('http://localhost:3001/api/v1/test-cases/projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Ensure the data is an array
            const projectsData = Array.isArray(result.data) ? result.data : [];
            setProjects(projectsData);
          }
        } else {
          console.error('Failed to fetch projects:', response.statusText);
          setProjects([]); // Fallback to empty array
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setProjects([]); // Fallback to empty array on error
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, token]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedProject(value === '' ? null : parseInt(value));
    setRefreshKey(prev => prev + 1); // Refresh data when filter changes
  };

  return (
    <DashboardLayout 
      title="Dashboard"
      subtitle="Real-time testing insights and performance metrics"
      user={user || undefined}
    >
      <div className={styles.dashboardHeader}>
        <div className={styles.dashboardInfo}>
          <h1 className={styles.dashboardTitle}>Overview</h1>
          <p className={styles.dashboardSubtitle}>
            Track your testing performance and identify areas for improvement
          </p>
        </div>
        
        <div className={styles.dashboardActions}>
          <div className={styles.filterGroup}>
            <label htmlFor="project-filter" className={styles.filterLabel}>
              Filter by Project:
            </label>
            <select
              id="project-filter"
              value={selectedProject || ''}
              onChange={handleProjectChange}
              className={styles.projectFilter}
              disabled={projectsLoading}
            >
              <option value="">All Projects</option>
              {Array.isArray(projects) && projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.testCaseCount} test cases)
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleRefresh} 
            className={styles.refreshButton}
            title="Refresh data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <DashboardOverview 
        key={`${refreshKey}-${selectedProject}`}
        loading={false}
        projectId={selectedProject}
      />
    </DashboardLayout>
  );
}
