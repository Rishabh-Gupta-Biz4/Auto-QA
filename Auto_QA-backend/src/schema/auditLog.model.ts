export interface AuditLog {
  id: number;
  userId?: number;
  projectId?: number;
  action: string;
  entityType: 'user' | 'project' | 'test_flow' | 'test_case' | 'test_execution' | 'bug_report' | 'report';
  entityId: number;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  createdAt: Date;
}

export const AuditLogSchema = `
  CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    project_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type ENUM('user', 'project', 'test_flow', 'test_case', 'test_execution', 'bug_report', 'report') NOT NULL,
    entity_id INT NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_entity_type (entity_type),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
  );
`;
