export interface TestFlow {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  flowSteps: FlowStep[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowStep {
  stepId: number;
  action: 'navigate' | 'click' | 'input' | 'wait' | 'verify' | 'scroll' | 'hover';
  target: string; // CSS selector or URL
  value?: string;
  description: string;
  expectedResult?: string;
  order: number;
}

export const TestFlowSchema = `
  CREATE TABLE test_flows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    flow_steps JSON NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id),
    INDEX idx_priority (priority),
    INDEX idx_active (is_active)
  );
`;
