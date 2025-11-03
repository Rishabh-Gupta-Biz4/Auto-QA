/**
 * Migration to create registration OTPs table
 */

import { connectDB, getDB } from '../connection';
import { logger } from '../../utils/logger';
import { RegistrationOTPSchema } from '../../services/otp.service';

async function createRegistrationOTPTable() {
  try {
    await connectDB();
    const db = getDB();
    
    logger.info('Creating registration_otps table...');

    // Check if table already exists
    const [tables] = await db.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'registration_otps'
    `);

    if (Array.isArray(tables) && tables.length > 0) {
      logger.info('✅ registration_otps table already exists');
      return;
    }

    // Create registration_otps table
    await db.execute(RegistrationOTPSchema);
    logger.info('✅ Created registration_otps table');

    logger.info('🎉 Registration OTP table migration completed successfully');
    
  } catch (error) {
    logger.error('❌ Error creating registration OTP table:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  createRegistrationOTPTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { createRegistrationOTPTable };

