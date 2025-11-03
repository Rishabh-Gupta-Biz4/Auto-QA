/**
 * SQL Query Validation Helpers
 * Safe query building and validation utilities
 */

import { InputSanitizer } from './input-sanitizer';
import mysql from 'mysql2/promise';

export class QueryValidator {
  
  /**
   * Whitelist of allowed table names
   * Add your table names here for additional security
   */
  private static readonly ALLOWED_TABLES = [
    'users',
    'projects',
    'test_cases',
    'test_executions',
    'test_flows',
    'test_reports',
    'bug_reports',
    'audit_logs',
    'migrations'
  ];

  /**
   * Whitelist of allowed column names for common operations
   */
  private static readonly ALLOWED_COLUMNS: Record<string, string[]> = {
    users: ['id', 'name', 'email', 'role', 'created_at', 'updated_at', 'last_login', 'is_active', 'email_verified'],
    projects: ['id', 'name', 'description', 'status', 'created_at', 'updated_at', 'created_by'],
    test_cases: ['id', 'title', 'description', 'test_type', 'priority', 'status', 'created_at', 'updated_at', 'project_id'],
    test_executions: ['id', 'test_case_id', 'status', 'start_time', 'end_time', 'result', 'project_id'],
    bug_reports: ['id', 'title', 'description', 'severity', 'status', 'created_at', 'project_id']
  };

  /**
   * Validate table name against whitelist
   */
  static validateTableName(tableName: string): string {
    const sanitized = InputSanitizer.sanitizeIdentifier(tableName);
    
    if (!this.ALLOWED_TABLES.includes(sanitized)) {
      throw new Error(`Invalid or unauthorized table name: ${tableName}`);
    }
    
    return sanitized;
  }

  /**
   * Validate column name for a specific table
   */
  static validateColumnName(tableName: string, columnName: string): string {
    const sanitizedTable = this.validateTableName(tableName);
    const sanitizedColumn = InputSanitizer.sanitizeIdentifier(columnName);
    
    const allowedColumns = this.ALLOWED_COLUMNS[sanitizedTable];
    if (allowedColumns && !allowedColumns.includes(sanitizedColumn)) {
      throw new Error(`Invalid or unauthorized column name: ${columnName} for table ${tableName}`);
    }
    
    return sanitizedColumn;
  }

  /**
   * Build a safe SELECT query with validation
   */
  static buildSelectQuery(options: {
    table: string;
    columns?: string[];
    where?: Record<string, any>;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  }): { query: string; params: any[] } {
    const { table, columns = ['*'], where, orderBy, orderDirection = 'DESC', limit, offset } = options;

    // Validate table name
    const validTable = this.validateTableName(table);

    // Validate columns
    const validColumns = columns[0] === '*' 
      ? ['*'] 
      : columns.map(col => this.validateColumnName(table, col));

    let query = `SELECT ${validColumns.join(', ')} FROM ${mysql.escapeId(validTable)}`;
    const params: any[] = [];

    // Add WHERE clause
    if (where && Object.keys(where).length > 0) {
      const whereClauses: string[] = [];
      
      Object.entries(where).forEach(([key, value]) => {
        const validColumn = this.validateColumnName(table, key);
        whereClauses.push(`${mysql.escapeId(validColumn)} = ?`);
        params.push(value);
      });
      
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Add ORDER BY clause
    if (orderBy) {
      const validOrderBy = this.validateColumnName(table, orderBy);
      const validDirection = orderDirection === 'ASC' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${mysql.escapeId(validOrderBy)} ${validDirection}`;
    }

    // Add LIMIT clause
    if (limit !== undefined) {
      const validLimit = InputSanitizer.validateLimit(limit);
      query += ` LIMIT ${validLimit}`;
    }

    // Add OFFSET clause
    if (offset !== undefined) {
      const validOffset = InputSanitizer.validateOffset(offset);
      query += ` OFFSET ${validOffset}`;
    }

    return { query, params };
  }

  /**
   * Build a safe INSERT query with validation
   */
  static buildInsertQuery(options: {
    table: string;
    data: Record<string, any>;
  }): { query: string; params: any[] } {
    const { table, data } = options;

    // Validate table name
    const validTable = this.validateTableName(table);

    // Validate column names
    const columns = Object.keys(data);
    const validColumns = columns.map(col => this.validateColumnName(table, col));
    
    // Build query
    const placeholders = columns.map(() => '?').join(', ');
    const columnsList = validColumns.map(col => mysql.escapeId(col)).join(', ');
    
    const query = `INSERT INTO ${mysql.escapeId(validTable)} (${columnsList}) VALUES (${placeholders})`;
    const params = columns.map(col => data[col]);

    return { query, params };
  }

  /**
   * Build a safe UPDATE query with validation
   */
  static buildUpdateQuery(options: {
    table: string;
    data: Record<string, any>;
    where: Record<string, any>;
  }): { query: string; params: any[] } {
    const { table, data, where } = options;

    // Validate table name
    const validTable = this.validateTableName(table);

    if (!where || Object.keys(where).length === 0) {
      throw new Error('WHERE clause is required for UPDATE queries');
    }

    // Validate and build SET clause
    const setColumns = Object.keys(data);
    const validSetColumns = setColumns.map(col => this.validateColumnName(table, col));
    
    const setClauses = validSetColumns.map(col => `${mysql.escapeId(col)} = ?`).join(', ');
    const setParams = setColumns.map(col => data[col]);

    // Validate and build WHERE clause
    const whereColumns = Object.keys(where);
    const validWhereColumns = whereColumns.map(col => this.validateColumnName(table, col));
    
    const whereClauses = validWhereColumns.map(col => `${mysql.escapeId(col)} = ?`).join(' AND ');
    const whereParams = whereColumns.map(col => where[col]);

    // Build query
    const query = `UPDATE ${mysql.escapeId(validTable)} SET ${setClauses} WHERE ${whereClauses}`;
    const params = [...setParams, ...whereParams];

    return { query, params };
  }

  /**
   * Build a safe DELETE query with validation
   */
  static buildDeleteQuery(options: {
    table: string;
    where: Record<string, any>;
  }): { query: string; params: any[] } {
    const { table, where } = options;

    // Validate table name
    const validTable = this.validateTableName(table);

    if (!where || Object.keys(where).length === 0) {
      throw new Error('WHERE clause is required for DELETE queries');
    }

    // Validate and build WHERE clause
    const whereColumns = Object.keys(where);
    const validWhereColumns = whereColumns.map(col => this.validateColumnName(table, col));
    
    const whereClauses = validWhereColumns.map(col => `${mysql.escapeId(col)} = ?`).join(' AND ');
    const whereParams = whereColumns.map(col => where[col]);

    // Build query
    const query = `DELETE FROM ${mysql.escapeId(validTable)} WHERE ${whereClauses}`;
    const params = whereParams;

    return { query, params };
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(page: any, limit: any, maxLimit: number = 100): {
    page: number;
    limit: number;
    offset: number;
  } {
    const validPage = Math.max(1, InputSanitizer.sanitizeInteger(page || 1));
    const validLimit = InputSanitizer.validateLimit(limit || 10, maxLimit);
    const offset = (validPage - 1) * validLimit;

    return {
      page: validPage,
      limit: validLimit,
      offset
    };
  }

  /**
   * Build safe pagination query
   */
  static buildPaginatedSelectQuery(options: {
    table: string;
    columns?: string[];
    where?: Record<string, any>;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    page: number;
    limit: number;
  }): { query: string; params: any[]; countQuery: string; countParams: any[] } {
    const { page, limit, ...selectOptions } = options;

    // Validate pagination
    const pagination = this.validatePagination(page, limit);

    // Build main query
    const { query, params } = this.buildSelectQuery({
      ...selectOptions,
      limit: pagination.limit,
      offset: pagination.offset
    });

    // Build count query
    const validTable = this.validateTableName(options.table);
    let countQuery = `SELECT COUNT(*) as total FROM ${mysql.escapeId(validTable)}`;
    const countParams: any[] = [];

    if (options.where && Object.keys(options.where).length > 0) {
      const whereClauses: string[] = [];
      
      Object.entries(options.where).forEach(([key, value]) => {
        const validColumn = this.validateColumnName(options.table, key);
        whereClauses.push(`${mysql.escapeId(validColumn)} = ?`);
        countParams.push(value);
      });
      
      countQuery += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    return { query, params, countQuery, countParams };
  }

  /**
   * Escape a string for use in LIKE clauses
   */
  static escapeLike(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_');
  }

  /**
   * Build safe LIKE query
   */
  static buildLikeCondition(column: string, value: string, type: 'starts' | 'ends' | 'contains' = 'contains'): {
    condition: string;
    value: string;
  } {
    const escaped = this.escapeLike(InputSanitizer.sanitizeString(value));
    
    let likeValue: string;
    switch (type) {
      case 'starts':
        likeValue = `${escaped}%`;
        break;
      case 'ends':
        likeValue = `%${escaped}`;
        break;
      case 'contains':
      default:
        likeValue = `%${escaped}%`;
        break;
    }

    return {
      condition: `${mysql.escapeId(column)} LIKE ?`,
      value: likeValue
    };
  }
}



