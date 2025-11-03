#!/usr/bin/env node

/**
 * Migration to add default test flow for generated test cases
 * Following Node.js rules: Create necessary default records
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { getConnection } from '../../config/database';
import { logger } from '../../utils/logger';

async function addDefaultTestFlow() {
  const connection = await getConnection();
  
  try {
    logger.info('Adding default test flow');
    
    // Insert default test flow if it doesn't exist
    await connection.execute(`
      INSERT IGNORE INTO test_flows (id, name, description, project_id, flow_steps, priority, is_active, created_by, created_at, updated_at) 
      VALUES (1, 'Generated Test Cases', 'Auto-generated test cases from AI', 1, '[]', 'medium', true, 3, NOW(), NOW())
    `);

    logger.info('Default test flow added successfully');

  } catch (error) {
    logger.error('Failed to add default test flow:', error);
    throw error;
  } finally {
    if (connection) {
      // Connection from getConnection doesn't need to be released manually
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  addDefaultTestFlow()
    .then(() => {
      logger.info('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}

export { addDefaultTestFlow };
