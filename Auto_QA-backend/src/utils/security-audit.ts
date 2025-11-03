/**
 * Security Audit Tool
 * Scans application for potential security vulnerabilities
 */

import { logger } from './logger';
import fs from 'fs';
import path from 'path';

export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'sql-injection' | 'xss' | 'insecure-pattern' | 'other';
  file: string;
  line: number;
  code: string;
  description: string;
  recommendation: string;
}

export class SecurityAuditor {
  private issues: SecurityIssue[] = [];

  /**
   * Patterns that indicate potential SQL injection vulnerabilities
   */
  private static readonly SQL_VULNERABILITY_PATTERNS = [
    {
      pattern: /execute\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`/g,
      severity: 'critical' as const,
      description: 'String interpolation in SQL query',
      recommendation: 'Use parameterized queries with ? placeholders'
    },
    {
      pattern: /execute\s*\(\s*"[^"]*\$\{[^}]+\}[^"]*"/g,
      severity: 'critical' as const,
      description: 'String interpolation in SQL query',
      recommendation: 'Use parameterized queries with ? placeholders'
    },
    {
      pattern: /execute\s*\(\s*[^,]+\s*\+\s*/g,
      severity: 'critical' as const,
      description: 'String concatenation in SQL query',
      recommendation: 'Use parameterized queries with ? placeholders'
    },
    {
      pattern: /query\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`/g,
      severity: 'critical' as const,
      description: 'String interpolation in SQL query',
      recommendation: 'Use parameterized queries with ? placeholders'
    },
    {
      pattern: /query\s*\(\s*"[^"]*\$\{[^}]+\}[^"]*"/g,
      severity: 'critical' as const,
      description: 'String interpolation in SQL query',
      recommendation: 'Use parameterized queries with ? placeholders'
    },
    {
      pattern: /query\s*\(\s*[^,]+\s*\+\s*/g,
      severity: 'critical' as const,
      description: 'String concatenation in SQL query',
      recommendation: 'Use parameterized queries with ? placeholders'
    }
  ];

  /**
   * Patterns that indicate potential XSS vulnerabilities
   */
  private static readonly XSS_VULNERABILITY_PATTERNS = [
    {
      pattern: /\.html\s*\(\s*req\.(body|query|params)/g,
      severity: 'high' as const,
      description: 'Unsanitized user input rendered as HTML',
      recommendation: 'Sanitize input before rendering'
    },
    {
      pattern: /innerHTML\s*=\s*req\.(body|query|params)/g,
      severity: 'high' as const,
      description: 'Unsanitized user input set as innerHTML',
      recommendation: 'Sanitize input before setting innerHTML'
    }
  ];

  /**
   * Patterns that indicate insecure coding practices
   */
  private static readonly INSECURE_PATTERNS = [
    {
      pattern: /eval\s*\(/g,
      severity: 'critical' as const,
      description: 'Use of eval() function',
      recommendation: 'Avoid eval() - use safer alternatives'
    },
    {
      pattern: /exec\s*\(\s*req\.(body|query|params)/g,
      severity: 'critical' as const,
      description: 'Command execution with user input',
      recommendation: 'Validate and sanitize input before executing commands'
    },
    {
      pattern: /crypto\.createHash\s*\(\s*['"]md5['"]/g,
      severity: 'medium' as const,
      description: 'Use of weak MD5 hashing algorithm',
      recommendation: 'Use bcrypt or argon2 for password hashing'
    },
    {
      pattern: /crypto\.createHash\s*\(\s*['"]sha1['"]/g,
      severity: 'medium' as const,
      description: 'Use of weak SHA1 hashing algorithm',
      recommendation: 'Use bcrypt or argon2 for password hashing'
    }
  ];

  /**
   * Scan a file for security issues
   */
  async scanFile(filePath: string): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // Check SQL injection patterns
      SecurityAuditor.SQL_VULNERABILITY_PATTERNS.forEach(({ pattern, severity, description, recommendation }) => {
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            this.issues.push({
              severity,
              type: 'sql-injection',
              file: filePath,
              line: index + 1,
              code: line.trim(),
              description,
              recommendation
            });
          }
          pattern.lastIndex = 0; // Reset regex
        });
      });

      // Check XSS patterns
      SecurityAuditor.XSS_VULNERABILITY_PATTERNS.forEach(({ pattern, severity, description, recommendation }) => {
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            this.issues.push({
              severity,
              type: 'xss',
              file: filePath,
              line: index + 1,
              code: line.trim(),
              description,
              recommendation
            });
          }
          pattern.lastIndex = 0;
        });
      });

      // Check insecure patterns
      SecurityAuditor.INSECURE_PATTERNS.forEach(({ pattern, severity, description, recommendation }) => {
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            this.issues.push({
              severity,
              type: 'insecure-pattern',
              file: filePath,
              line: index + 1,
              code: line.trim(),
              description,
              recommendation
            });
          }
          pattern.lastIndex = 0;
        });
      });
    } catch (error) {
      logger.error(`Error scanning file ${filePath}:`, error);
    }
  }

  /**
   * Recursively scan a directory
   */
  async scanDirectory(dirPath: string, extensions: string[] = ['.ts', '.js']): Promise<void> {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and dist directories
          if (entry.name !== 'node_modules' && entry.name !== 'dist') {
            await this.scanDirectory(fullPath, extensions);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            await this.scanFile(fullPath);
          }
        }
      }
    } catch (error) {
      logger.error(`Error scanning directory ${dirPath}:`, error);
    }
  }

  /**
   * Get all detected issues
   */
  getIssues(): SecurityIssue[] {
    return this.issues;
  }

  /**
   * Get issues by severity
   */
  getIssuesBySeverity(severity: 'critical' | 'high' | 'medium' | 'low'): SecurityIssue[] {
    return this.issues.filter(issue => issue.severity === severity);
  }

  /**
   * Get issues by type
   */
  getIssuesByType(type: 'sql-injection' | 'xss' | 'insecure-pattern' | 'other'): SecurityIssue[] {
    return this.issues.filter(issue => issue.type === type);
  }

  /**
   * Generate audit report
   */
  generateReport(): string {
    const criticalCount = this.getIssuesBySeverity('critical').length;
    const highCount = this.getIssuesBySeverity('high').length;
    const mediumCount = this.getIssuesBySeverity('medium').length;
    const lowCount = this.getIssuesBySeverity('low').length;

    let report = '\n' + '='.repeat(80) + '\n';
    report += '                      SECURITY AUDIT REPORT\n';
    report += '='.repeat(80) + '\n\n';

    report += `Total Issues Found: ${this.issues.length}\n\n`;
    report += `  🔴 Critical: ${criticalCount}\n`;
    report += `  🟠 High:     ${highCount}\n`;
    report += `  🟡 Medium:   ${mediumCount}\n`;
    report += `  🟢 Low:      ${lowCount}\n\n`;

    if (this.issues.length === 0) {
      report += '✅ No security issues detected!\n\n';
      return report;
    }

    // Group issues by severity
    ['critical', 'high', 'medium', 'low'].forEach(severity => {
      const severityIssues = this.getIssuesBySeverity(severity as any);
      
      if (severityIssues.length > 0) {
        report += '\n' + '-'.repeat(80) + '\n';
        report += `${severity.toUpperCase()} SEVERITY ISSUES (${severityIssues.length})\n`;
        report += '-'.repeat(80) + '\n\n';

        severityIssues.forEach((issue, index) => {
          report += `${index + 1}. ${issue.description}\n`;
          report += `   File: ${issue.file}\n`;
          report += `   Line: ${issue.line}\n`;
          report += `   Type: ${issue.type}\n`;
          report += `   Code: ${issue.code}\n`;
          report += `   Fix:  ${issue.recommendation}\n\n`;
        });
      }
    });

    report += '='.repeat(80) + '\n\n';
    return report;
  }

  /**
   * Save report to file
   */
  async saveReport(outputPath: string): Promise<void> {
    const report = this.generateReport();
    await fs.promises.writeFile(outputPath, report, 'utf-8');
    logger.info(`Security audit report saved to: ${outputPath}`);
  }

  /**
   * Print report to console
   */
  printReport(): void {
    console.log(this.generateReport());
  }
}

/**
 * Run security audit on the project
 */
export async function runSecurityAudit(srcPath: string): Promise<SecurityAuditor> {
  logger.info('Starting security audit...');
  
  const auditor = new SecurityAuditor();
  await auditor.scanDirectory(srcPath);
  
  const issueCount = auditor.getIssues().length;
  if (issueCount > 0) {
    logger.warn(`Security audit completed: ${issueCount} issues found`);
  } else {
    logger.info('Security audit completed: No issues found');
  }
  
  return auditor;
}



