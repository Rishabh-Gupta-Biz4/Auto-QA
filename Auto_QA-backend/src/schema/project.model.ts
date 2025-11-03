export interface Project {
  id: number;
  name: string;
  description?: string;
  baseUrl: string;
  loginCredentials: {
    username: string;
    password: string;
    loginUrl?: string;
    additionalFields?: Record<string, string>;
  };
  environment: 'development' | 'staging' | 'production';
  status: 'active' | 'inactive' | 'archived';
  createdBy: number;
  teamMembers: number[];
  settings: {
    maxDepth: number;
    excludePatterns: string[];
    includePatterns: string[];
    timeout: number;
    retries: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const ProjectSchema = `
  CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_url VARCHAR(500) NOT NULL,
    login_credentials JSON NOT NULL,
    environment ENUM('development', 'staging', 'production') DEFAULT 'development',
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    created_by INT NOT NULL,
    team_members JSON,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_environment (environment),
    INDEX idx_created_by (created_by)
  );
`;
