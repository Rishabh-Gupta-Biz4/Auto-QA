export interface TestCase {
  id: number;
  testFlowId: number;
  projectId: number;
  title: string;
  description: string;
  testType: 'functional' | 'ui' | 'api' | 'performance' | 'security' | 'accessibility';
  category: 'smoke' | 'regression' | 'integration' | 'e2e' | 'unit';
  steps: TestStep[];
  expectedResult: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
  estimatedDuration: number; // in seconds
  tags: string[];
  createdBy: 'system' | number; // 'system' for auto-generated, user_id for manual
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestStep {
  stepId: number;
  action: string;
  target: string;
  input?: string;
  expectedBehavior: string;
  order: number;
}

export const TestCaseSchema = `
  CREATE TABLE test_cases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_flow_id INT NOT NULL,
    project_id INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    test_type ENUM('functional', 'ui', 'api', 'performance', 'security', 'accessibility') NOT NULL,
    category ENUM('smoke', 'regression', 'integration', 'e2e', 'unit') NOT NULL,
    steps JSON NOT NULL,
    expected_result TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    automation_level ENUM('manual', 'semi-automated', 'fully-automated') DEFAULT 'fully-automated',
    estimated_duration INT DEFAULT 30,
    tags JSON,
    created_by VARCHAR(20) DEFAULT 'system',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (test_flow_id) REFERENCES test_flows(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_test_flow_id (test_flow_id),
    INDEX idx_project_id (project_id),
    INDEX idx_test_type (test_type),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_active (is_active)
  );
`;
