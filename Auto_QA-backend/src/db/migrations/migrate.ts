#!/usr/bin/env node

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { dbManager } from '../connection';
import { logger } from '../../utils/logger';

async function runMigrations() {
  try {
    logger.info('Starting database migration process');
    
    // Initialize database
    await dbManager.initializeDatabase();
    
    logger.info('Migration process completed successfully');
    logger.info('Database schema summary', {
      tables: [
        'users - User authentication and authorization',
        'projects - Website/application projects being tested',
        'test_flows - User-defined testing flows and scenarios',
        'test_cases - Auto-generated and manual test cases',
        'test_executions - Test execution results and logs',
        'bug_reports - Detailed bug reports with reproduction steps',
        'test_reports - Generated CSV/PDF reports for stakeholders',
        'audit_logs - System audit trail for compliance and debugging'
      ]
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
