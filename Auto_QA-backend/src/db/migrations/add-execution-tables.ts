#!/usr/bin/env node

/**
 * Migration to add test execution related tables
 * Following Node.js rules: Create necessary tables for test execution functionality
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { getConnection } from '../../config/database';
import { logger } from '../../utils/logger';

async function addExecutionTables() {
  const connection = await getConnection();
  
  try {
    logger.info('Adding test execution tables');
    
    // Add test_execution_results table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_execution_results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        test_execution_id INT NOT NULL,
        test_case_id VARCHAR(50) NOT NULL,
        status ENUM('passed', 'failed', 'skipped') NOT NULL,
        duration INT DEFAULT 0,
        error_message TEXT,
        response_data JSON,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_execution_id (test_execution_id),
        INDEX idx_test_case_id (test_case_id),
        INDEX idx_status (status),
        INDEX idx_executed_at (executed_at)
      );
    `);

    // Add test_generation_history table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_generation_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        website_url VARCHAR(500) NOT NULL,
        test_cases_count INT DEFAULT 0,
        generation_method VARCHAR(100) DEFAULT 'AI',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_website_url (website_url),
        INDEX idx_created_at (created_at)
      );
    `);

    logger.info('Test execution tables added successfully');

  } catch (error) {
    logger.error('Failed to add test execution tables:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  addExecutionTables()
    .then(() => {
      logger.info('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}

export { addExecutionTables };
