import { createConnectionPool, getConnection, closeConnection } from '../config/database';
import { AllSchemas, MigrationOrder } from '../schema';
import { logger } from '../utils/logger';
import mysql from 'mysql2/promise';

class DatabaseManager {
  private pool: mysql.Pool;

  constructor() {
    this.pool = createConnectionPool();
  }

  async testConnection(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      logger.info('Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  async createDatabase(): Promise<void> {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
      });

      // SECURITY FIX: Use parameterized query with identifier escaping
      const dbName = process.env.DB_NAME || 'auto_qa_db';
      // Validate database name - only alphanumeric and underscores
      if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
        throw new Error('Invalid database name format');
      }
      
      // Use mysql.escapeId to safely escape identifiers
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${mysql.escapeId(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await connection.end();
      logger.info('Database created successfully');
    } catch (error) {
      console.error('❌ Database creation failed:', error);
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    try {
      logger.info('Running database migrations');
      
      // Create migrations table if it doesn't exist
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INT PRIMARY KEY AUTO_INCREMENT,
          migration_name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_migration (migration_name)
        )
      `);

      // Execute each schema in order
      for (let i = 0; i < AllSchemas.length; i++) {
        const schema = AllSchemas[i];
        const tableName = MigrationOrder[i];

        try {
          // Check if migration already executed
          const [rows] = await this.pool.execute(
            'SELECT id FROM migrations WHERE migration_name = ?',
            [tableName]
          );

          if (Array.isArray(rows) && rows.length === 0) {
            // Execute the schema
            await this.pool.execute(schema);
            
            // Record the migration
            await this.pool.execute(
              'INSERT INTO migrations (migration_name) VALUES (?)',
              [tableName]
            );
            
            logger.info(`Migration ${tableName} executed successfully`);
          } else {
            logger.info(`Migration ${tableName} already executed`);
          }
        } catch (error) {
          console.error(`❌ Migration ${tableName} failed:`, error);
          throw error;
        }
      }

      logger.info('All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration process failed:', error);
      throw error;
    }
  }

  async seedDatabase(): Promise<void> {
    try {
      logger.info('Seeding database with initial data');

      // Create default admin user
      const [existingAdmin] = await this.pool.execute(
        'SELECT id FROM users WHERE email = ?',
        ['admin@autoqa.com']
      );

      if (Array.isArray(existingAdmin) && existingAdmin.length === 0) {
        await this.pool.execute(`
          INSERT INTO users (name, email, password, role, email_verified, is_active) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          'System Admin',
          'admin@autoqa.com',
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          'admin',
          true,
          true
        ]);
        logger.info('Default admin user created');
      }

      logger.info('Database seeding completed');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async initializeDatabase(): Promise<void> {
    try {
      logger.info('Initializing database');
      
      await this.createDatabase();
      await this.testConnection();
      await this.runMigrations();
      await this.seedDatabase();
      
      logger.info('Database initialization completed successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  getPool(): mysql.Pool {
    return this.pool;
  }

  async closeConnection(): Promise<void> {
    await closeConnection();
    logger.info('Database connection closed');
  }
}

export const dbManager = new DatabaseManager();
export const connectDB = () => dbManager.initializeDatabase();
export const getDB = () => dbManager.getPool();
export const disconnectDB = () => dbManager.closeConnection();