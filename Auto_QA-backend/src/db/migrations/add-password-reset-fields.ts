/**
 * Migration to add password reset fields to users table
 */

import { connectDB, getDB } from '../connection';
import { logger } from '../../utils/logger';

async function addPasswordResetFields() {
  try {
    await connectDB();
    const db = getDB();
    
    logger.info('Adding password reset fields to users table...');

    // Check if columns already exist
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('password_reset_token', 'password_reset_expires')
    `);

    if (Array.isArray(columns) && columns.length === 2) {
      logger.info('✅ Password reset fields already exist');
      return;
    }

    // Add password_reset_token column if it doesn't exist
    const tokenColumns = (columns as any[]).filter(col => col.COLUMN_NAME === 'password_reset_token');
    if (tokenColumns.length === 0) {
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN password_reset_token VARCHAR(255) NULL AFTER last_login
      `);
      logger.info('✅ Added password_reset_token column');
    }

    // Add password_reset_expires column if it doesn't exist
    const expiresColumns = (columns as any[]).filter(col => col.COLUMN_NAME === 'password_reset_expires');
    if (expiresColumns.length === 0) {
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN password_reset_expires TIMESTAMP NULL AFTER password_reset_token
      `);
      logger.info('✅ Added password_reset_expires column');
    }

    // Add index for password_reset_token
    try {
      await db.execute(`
        CREATE INDEX idx_password_reset_token ON users (password_reset_token)
      `);
      logger.info('✅ Added index for password_reset_token');
    } catch (error: any) {
      if (error.code === 'ER_DUP_KEYNAME') {
        logger.info('✅ Index for password_reset_token already exists');
      } else {
        throw error;
      }
    }

    logger.info('🎉 Password reset fields migration completed successfully');
    
  } catch (error) {
    logger.error('❌ Error adding password reset fields:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addPasswordResetFields()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { addPasswordResetFields };
