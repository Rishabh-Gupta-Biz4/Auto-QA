export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'qa_lead' | 'qa_engineer' | 'developer';
  avatar?: string;
  googleId?: string;
  profilePicture?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = `
  CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'qa_lead', 'qa_engineer', 'developer') DEFAULT 'qa_engineer',
    avatar VARCHAR(500),
    google_id VARCHAR(255) UNIQUE NULL,
    profile_picture VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_google_id (google_id)
  );
`;
