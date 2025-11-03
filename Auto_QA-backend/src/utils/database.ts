import { getDB } from '../db/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class DatabaseUtils {
  private static pool = getDB();

  // Generic query execution
  static async executeQuery<T extends RowDataPacket[]>(
    query: string, 
    params: any[] = []
  ): Promise<T> {
    try {
      const [rows] = await this.pool.execute<T>(query, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Insert query with return of inserted ID
  static async executeInsert(
    query: string, 
    params: any[] = []
  ): Promise<number> {
    try {
      const [result] = await this.pool.execute<ResultSetHeader>(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    }
  }

  // Update/Delete query with return of affected rows
  static async executeUpdate(
    query: string, 
    params: any[] = []
  ): Promise<number> {
    try {
      const [result] = await this.pool.execute<ResultSetHeader>(query, params);
      return result.affectedRows;
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }
  }

  // Transaction wrapper
  static async executeTransaction<T>(
    callback: (connection: any) => Promise<T>
  ): Promise<T> {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Pagination helper
  static buildPaginationQuery(
    baseQuery: string,
    page: number = 1,
    limit: number = 10,
    orderBy: string = 'created_at',
    orderDirection: 'ASC' | 'DESC' = 'DESC'
  ): { query: string; offset: number } {
    const offset = (page - 1) * limit;
    const query = `${baseQuery} ORDER BY ${orderBy} ${orderDirection} LIMIT ${limit} OFFSET ${offset}`;
    return { query, offset };
  }

  // Count query for pagination
  static async getCount(
    table: string,
    whereClause: string = '',
    params: any[] = []
  ): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
    const rows = await this.executeQuery<RowDataPacket[]>(query, params);
    return rows[0]?.count || 0;
  }

  // Bulk insert helper
  static async bulkInsert(
    table: string,
    columns: string[],
    values: any[][],
    onDuplicateKey: string = ''
  ): Promise<number> {
    if (values.length === 0) return 0;

    const placeholders = values.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
    const flatValues = values.flat();
    
    let query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
    if (onDuplicateKey) {
      query += ` ON DUPLICATE KEY UPDATE ${onDuplicateKey}`;
    }

    const result = await this.executeUpdate(query, flatValues);
    return result;
  }

  // Search helper with full-text search
  static buildSearchQuery(
    baseQuery: string,
    searchColumns: string[],
    searchTerm: string
  ): { query: string; params: any[] } {
    if (!searchTerm.trim()) {
      return { query: baseQuery, params: [] };
    }

    const searchConditions = searchColumns.map(column => `${column} LIKE ?`).join(' OR ');
    const searchParams = searchColumns.map(() => `%${searchTerm}%`);
    
    const whereClause = baseQuery.toLowerCase().includes('where') 
      ? ` AND (${searchConditions})`
      : ` WHERE (${searchConditions})`;
    
    return {
      query: baseQuery + whereClause,
      params: searchParams
    };
  }

  // Date range filter helper
  static buildDateRangeQuery(
    baseQuery: string,
    dateColumn: string,
    startDate?: Date,
    endDate?: Date
  ): { query: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    if (startDate) {
      conditions.push(`${dateColumn} >= ?`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`${dateColumn} <= ?`);
      params.push(endDate);
    }

    if (conditions.length === 0) {
      return { query: baseQuery, params: [] };
    }

    const whereClause = baseQuery.toLowerCase().includes('where')
      ? ` AND ${conditions.join(' AND ')}`
      : ` WHERE ${conditions.join(' AND ')}`;

    return {
      query: baseQuery + whereClause,
      params
    };
  }
}
