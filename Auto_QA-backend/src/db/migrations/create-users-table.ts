/**
 * Migration to create users table
 * Run this to set up the authentication system
 */

import { Pool } from 'mysql2/promise';
import { UserSchema } from '../../schema/user.model';
import { logger } from '../../utils/logger';

export async function createUsersTable(db: Pool): Promise<void> {
  try {
    logger.info('Creating users table...');
    
    // Drop table if exists (for development only)
    await db.execute('DROP TABLE IF EXISTS users');
    
    // Create users table
    await db.execute(UserSchema);
    
    // Insert a default admin user for testing
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123!', 12);
    
    await db.execute(`
      INSERT INTO users (name, email, password, role, is_active, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, true, true, NOW(), NOW())
    `, ['Admin User', 'admin@autoqa.com', adminPassword, 'admin']);
    
    // Insert a test QA engineer user
    const userPassword = await bcrypt.hash('password123!', 12);
    
    await db.execute(`
      INSERT INTO users (name, email, password, role, is_active, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, true, true, NOW(), NOW())
    `, ['John Newman', 'john@autoqa.com', userPassword, 'qa_engineer']);
    
    logger.info('Users table created successfully');
    logger.info('Default users created:');
    logger.info('  Admin: admin@autoqa.com / admin123!');
    logger.info('  User: john@autoqa.com / password123!');
    
  } catch (error) {
    logger.error('Error creating users table:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const { connectDB, getDB } = require('../connection');
  
  async function runMigration() {
    try {
      await connectDB();
      const db = getDB();
      await createUsersTable(db);
      process.exit(0);
    } catch (error) {
      logger.error('Migration failed:', error);
      process.exit(1);
    }
  }
  
  runMigration();
}
