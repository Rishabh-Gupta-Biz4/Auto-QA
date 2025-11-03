import mysql from 'mysql2/promise';
import { envConfig } from '@/utils/env-loader';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  acquireTimeout: number;
  timeout: number;
  reconnect: boolean;
  charset: string;
}

export const databaseConfig: DatabaseConfig = {
  host: envConfig.get('DB_HOST', 'localhost'),
  port: parseInt(envConfig.get('DB_PORT', '3306'), 10),
  user: envConfig.get('DB_USER', 'root'),
  password: envConfig.get('DB_PASSWORD', ''),
  database: envConfig.get('DB_NAME', 'auto_qa_db'),
  connectionLimit: parseInt(envConfig.get('DB_CONNECTION_LIMIT', '10'), 10),
  acquireTimeout: parseInt(envConfig.get('DB_ACQUIRE_TIMEOUT', '60000'), 10),
  timeout: parseInt(envConfig.get('DB_TIMEOUT', '60000'), 10),
  reconnect: true,
  charset: 'utf8mb4',
};


// Connection pool
let pool: mysql.Pool;

export const createConnectionPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.user,
      password: databaseConfig.password,
      database: databaseConfig.database,
      waitForConnections: true,
      connectionLimit: databaseConfig.connectionLimit,
      queueLimit: 0,
      charset: databaseConfig.charset,
      timezone: '+00:00',
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: true,
    });
  }
  return pool;
};

export const getConnection = (): mysql.Pool => {
  if (!pool) {
    pool = createConnectionPool();
  }
  return pool;
};

export const closeConnection = async (): Promise<void> => {
  if (pool) {
    await pool.end();
  }
};