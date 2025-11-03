export interface TestExecution {
  id: number;
  testCaseId: number;
  projectId: number;
  testFlowId: number;
  batchId: string; // Group related test executions
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped' | 'blocked';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  environment: string;
  browser: string;
  browserVersion: string;
  screenResolution: string;
  executedBy: 'system' | number;
  logs: ExecutionLog[];
  screenshots: string[];
  videoPath?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  stepId?: number;
  screenshot?: string;
}

export const TestExecutionSchema = `
  CREATE TABLE test_executions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_case_id INT NOT NULL,
    project_id INT NOT NULL,
    test_flow_id INT NOT NULL,
    batch_id VARCHAR(100) NOT NULL,
    status ENUM('pending', 'running', 'passed', 'failed', 'skipped', 'blocked') DEFAULT 'pending',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    duration INT NULL,
    environment VARCHAR(50),
    browser VARCHAR(50),
    browser_version VARCHAR(20),
    screen_resolution VARCHAR(20),
    executed_by VARCHAR(20) DEFAULT 'system',
    logs JSON,
    screenshots JSON,
    video_path VARCHAR(500),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (test_flow_id) REFERENCES test_flows(id) ON DELETE CASCADE,
    INDEX idx_test_case_id (test_case_id),
    INDEX idx_project_id (project_id),
    INDEX idx_batch_id (batch_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
  );
`;
