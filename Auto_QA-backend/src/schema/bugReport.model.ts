export interface BugReport {
  id: number;
  testExecutionId: number;
  projectId: number;
  testCaseId: number;
  title: string;
  description: string;
  bugType: 'functional' | 'ui' | 'api' | 'performance' | 'security' | 'accessibility' | 'usability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'rejected';
  endpoint: string; // URL where bug was found
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  statusCode?: number;
  reproductionSteps: string[];
  expectedBehavior: string;
  actualBehavior: string;
  environment: string;
  browser: string;
  screenResolution: string;
  screenshots: string[];
  videoPath?: string;
  errorLogs: string[];
  networkLogs?: string[];
  consoleErrors?: string[];
  assignedTo?: number;
  reportedBy: 'system' | number;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const BugReportSchema = `
  CREATE TABLE bug_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_execution_id INT NOT NULL,
    project_id INT NOT NULL,
    test_case_id INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    bug_type ENUM('functional', 'ui', 'api', 'performance', 'security', 'accessibility', 'usability') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    status ENUM('open', 'in-progress', 'resolved', 'closed', 'rejected') DEFAULT 'open',
    endpoint VARCHAR(1000) NOT NULL,
    http_method ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH') NULL,
    status_code INT NULL,
    reproduction_steps JSON NOT NULL,
    expected_behavior TEXT NOT NULL,
    actual_behavior TEXT NOT NULL,
    environment VARCHAR(50) NOT NULL,
    browser VARCHAR(50) NOT NULL,
    screen_resolution VARCHAR(20) NOT NULL,
    screenshots JSON,
    video_path VARCHAR(500),
    error_logs JSON,
    network_logs JSON,
    console_errors JSON,
    assigned_to INT NULL,
    reported_by VARCHAR(20) DEFAULT 'system',
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (test_execution_id) REFERENCES test_executions(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_test_execution_id (test_execution_id),
    INDEX idx_project_id (project_id),
    INDEX idx_bug_type (bug_type),
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_endpoint (endpoint(255))
  );
`;
