export interface TestReport {
  id: number;
  projectId: number;
  batchId: string;
  reportName: string;
  reportType: 'execution_summary' | 'bug_report' | 'coverage_report' | 'performance_report';
  status: 'generating' | 'completed' | 'failed';
  filePath: string; // Path to generated CSV/PDF file
  fileSize: number;
  recordCount: number;
  filters: ReportFilters;
  summary: ReportSummary;
  generatedBy: number;
  scheduledAt?: Date;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportFilters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  testTypes?: string[];
  severities?: string[];
  statuses?: string[];
  environments?: string[];
  browsers?: string[];
}

export interface ReportSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalBugs: number;
  criticalBugs: number;
  highBugs: number;
  mediumBugs: number;
  lowBugs: number;
  executionTime: number;
  coveragePercentage?: number;
}

export const TestReportSchema = `
  CREATE TABLE test_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    batch_id VARCHAR(100),
    report_name VARCHAR(255) NOT NULL,
    report_type ENUM('execution_summary', 'bug_report', 'coverage_report', 'performance_report') NOT NULL,
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT DEFAULT 0,
    record_count INT DEFAULT 0,
    filters JSON,
    summary JSON,
    generated_by INT NOT NULL,
    scheduled_at TIMESTAMP NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id),
    INDEX idx_batch_id (batch_id),
    INDEX idx_report_type (report_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
  );
`;
