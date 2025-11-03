/**
 * Migration to update password reset system from token to OTP
 */

import { connectDB, getDB } from '../connection';
import { logger } from '../../utils/logger';

async function updateToOtpSystem() {
  try {
    await connectDB();
    const db = getDB();
    
    logger.info('Updating password reset system to use OTP...');

    // Check if the old column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'password_reset_token'
    `);

    if (Array.isArray(columns) && columns.length > 0) {
      // Drop the old index first
      try {
        await db.execute(`DROP INDEX idx_password_reset_token ON users`);
        logger.info('✅ Dropped old password_reset_token index');
      } catch (error: any) {
        if (error.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
          logger.info('ℹ️  Index idx_password_reset_token already dropped or doesn\'t exist');
        }
      }

      // Drop the old column and add new OTP column
      await db.execute(`
        ALTER TABLE users 
        DROP COLUMN password_reset_token,
        ADD COLUMN password_reset_otp VARCHAR(10) NULL AFTER last_login
      `);
      logger.info('✅ Updated password_reset_token to password_reset_otp');
    } else {
      // Check if OTP column already exists
      const [otpColumns] = await db.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'password_reset_otp'
      `);

      if (Array.isArray(otpColumns) && otpColumns.length === 0) {
        // Add OTP column if it doesn't exist
        await db.execute(`
          ALTER TABLE users 
          ADD COLUMN password_reset_otp VARCHAR(10) NULL AFTER last_login
        `);
        logger.info('✅ Added password_reset_otp column');
      } else {
        logger.info('✅ password_reset_otp column already exists');
      }
    }

    // Add new index for OTP
    try {
      await db.execute(`
        CREATE INDEX idx_password_reset_otp ON users (password_reset_otp)
      `);
      logger.info('✅ Added index for password_reset_otp');
    } catch (error: any) {
      if (error.code === 'ER_DUP_KEYNAME') {
        logger.info('✅ Index for password_reset_otp already exists');
      } else {
        throw error;
      }
    }

    // Clear any existing reset data since we're changing the system
    await db.execute(`
      UPDATE users 
      SET password_reset_otp = NULL, password_reset_expires = NULL 
      WHERE password_reset_otp IS NOT NULL OR password_reset_expires IS NOT NULL
    `);
    logger.info('✅ Cleared existing reset data');

    logger.info('🎉 OTP system migration completed successfully');
    
  } catch (error) {
    logger.error('❌ Error updating to OTP system:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  updateToOtpSystem()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { updateToOtpSystem };
