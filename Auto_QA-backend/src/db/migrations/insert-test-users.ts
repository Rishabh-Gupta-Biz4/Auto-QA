/**
 * Insert test users for authentication testing
 */

import { connectDB, getDB } from '../connection';
import { logger } from '../../utils/logger';
import bcrypt from 'bcryptjs';

async function insertTestUsers() {
  try {
    await connectDB();
    const db = getDB();
    
    logger.info('Inserting test users...');

    // Check if users already exist
    const [existingUsers] = await db.execute('SELECT email FROM users WHERE email IN (?, ?)', [
      'john@autoqa.com',
      'admin@autoqa.com'
    ]);

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      logger.info('Test users already exist. Updating passwords...');
      
      // Update existing users with correct passwords
      const adminPassword = await bcrypt.hash('admin123!', 12);
      const userPassword = await bcrypt.hash('password123!', 12);
      
      await db.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [adminPassword, 'admin@autoqa.com']
      );
      
      await db.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [userPassword, 'john@autoqa.com']
      );
      
      logger.info('✅ Test user passwords updated');
    } else {
      // Insert new test users
      const adminPassword = await bcrypt.hash('admin123!', 12);
      const userPassword = await bcrypt.hash('password123!', 12);
      
      // Insert admin user
      await db.execute(`
        INSERT INTO users (name, email, password, role, is_active, email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, true, true, NOW(), NOW())
      `, ['Admin User', 'admin@autoqa.com', adminPassword, 'admin']);
      
      // Insert test user
      await db.execute(`
        INSERT INTO users (name, email, password, role, is_active, email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, true, true, NOW(), NOW())
      `, ['John Newman', 'john@autoqa.com', userPassword, 'qa_engineer']);
      
      logger.info('✅ Test users created');
    }

    // Also insert a user that matches the credentials you're testing
    const [johnExampleUser] = await db.execute('SELECT email FROM users WHERE email = ?', ['john@example.com']);
    
    if (Array.isArray(johnExampleUser) && johnExampleUser.length === 0) {
      const johnPassword = await bcrypt.hash('password123!', 12);
      await db.execute(`
        INSERT INTO users (name, email, password, role, is_active, email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, true, true, NOW(), NOW())
      `, ['John Example', 'john@example.com', johnPassword, 'qa_engineer']);
      
      logger.info('✅ john@example.com user created');
    }

    logger.info('🎉 All test users ready!');
    logger.info('Test credentials:');
    logger.info('  📧 admin@autoqa.com / admin123!');
    logger.info('  📧 john@autoqa.com / password123!');
    logger.info('  📧 john@example.com / password123!');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error inserting test users:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  insertTestUsers();
}

export { insertTestUsers };
