/**
 * Security Audit CLI Tool
 * Run this script to scan for SQL injection and other security vulnerabilities
 * 
 * Usage: npm run security:audit
 */

import { runSecurityAudit } from '../utils/security-audit';
import path from 'path';
import { logger } from '../utils/logger';

async function main() {
  console.log('\n🔍 Starting Security Audit...\n');
  
  const srcPath = path.join(__dirname, '..');
  
  try {
    // Run the security audit
    const auditor = await runSecurityAudit(srcPath);
    
    // Print report to console
    auditor.printReport();
    
    // Save report to file
    const reportPath = path.join(__dirname, '../../security-audit-report.txt');
    await auditor.saveReport(reportPath);
    
    // Check for critical issues
    const criticalIssues = auditor.getIssuesBySeverity('critical');
    const highIssues = auditor.getIssuesBySeverity('high');
    
    if (criticalIssues.length > 0) {
      console.error(`\n❌ CRITICAL: Found ${criticalIssues.length} critical security issues!`);
      console.error('   These must be fixed immediately!\n');
      process.exit(1);
    }
    
    if (highIssues.length > 0) {
      console.warn(`\n⚠️  WARNING: Found ${highIssues.length} high severity issues!`);
      console.warn('   These should be fixed as soon as possible!\n');
      process.exit(1);
    }
    
    const totalIssues = auditor.getIssues().length;
    if (totalIssues === 0) {
      console.log('\n✅ Security audit passed! No issues found.\n');
    } else {
      console.log(`\n✅ No critical or high severity issues found.`);
      console.log(`   ${totalIssues} medium/low issues detected - please review.\n`);
    }
    
  } catch (error) {
    logger.error('Security audit failed:', error);
    console.error('\n❌ Security audit failed:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});



