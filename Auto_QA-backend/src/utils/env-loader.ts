import * as fs from 'fs';
import * as path from 'path';

/**
 * Environment configuration loader utility
 * Following Node.js rules: Use env.json for configuration management
 */

interface EnvConfig {
  [key: string]: string;
}

class EnvironmentLoader {
  private config: EnvConfig = {};
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.loadEnvironmentConfig();
  }

  /**
   * Load environment configuration from env.json file
   * @throws Error when env.json file is not found or invalid
   */
  private loadEnvironmentConfig(): void {
    try {
      const envFilePath = path.join(process.cwd(), 'env.json');
      
      if (!fs.existsSync(envFilePath)) {
        throw new Error('env.json file not found in project root');
      }

      const envData = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
      
      if (!envData[this.environment]) {
        throw new Error(`Configuration for environment '${this.environment}' not found in env.json`);
      }

      this.config = envData[this.environment];
      
      // Set process.env variables for compatibility
      Object.keys(this.config).forEach(key => {
        if (!process.env[key]) {
          process.env[key] = this.config[key];
        }
      });

    } catch (error) {
      console.error('Failed to load environment configuration:', error);
      throw error;
    }
  }

  /**
   * Get configuration value by key
   * @param key - Configuration key
   * @param defaultValue - Default value if key not found
   * @returns Configuration value or default
   */
  public get(key: string, defaultValue?: string): string {
    return this.config[key] || defaultValue || '';
  }

  /**
   * Get current environment
   * @returns Current environment name
   */
  public getEnvironment(): string {
    return this.environment;
  }

  /**
   * Get all configuration for current environment
   * @returns Complete configuration object
   */
  public getConfig(): EnvConfig {
    return { ...this.config };
  }

  /**
   * Check if we're in production environment
   * @returns true if production environment
   */
  public isProduction(): boolean {
    return this.environment === 'production';
  }

  /**
   * Check if we're in development environment
   * @returns true if development environment
   */
  public isDevelopment(): boolean {
    return this.environment === 'development';
  }

  /**
   * Check if we're in test environment
   * @returns true if test environment
   */
  public isTest(): boolean {
    return this.environment === 'test';
  }
}

// Export singleton instance
export const envConfig = new EnvironmentLoader();
export default envConfig;
