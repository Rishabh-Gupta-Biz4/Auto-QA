// Database Schema Exports
export * from './user.model';
export * from './project.model';
export * from './testFlow.model';
export * from './testCase.model';
export * from './testExecution.model';
export * from './bugReport.model';
export * from './testReport.model';
export * from './auditLog.model';
export { RegistrationOTPSchema } from '../services/otp.service';

// All Schema Creation Queries
import { UserSchema } from './user.model';
import { ProjectSchema } from './project.model';
import { TestFlowSchema } from './testFlow.model';
import { TestCaseSchema } from './testCase.model';
import { TestExecutionSchema } from './testExecution.model';
import { BugReportSchema } from './bugReport.model';
import { TestReportSchema } from './testReport.model';
import { AuditLogSchema } from './auditLog.model';
import { RegistrationOTPSchema } from '../services/otp.service';

export const AllSchemas = [
  UserSchema,
  RegistrationOTPSchema,
  ProjectSchema,
  TestFlowSchema,
  TestCaseSchema,
  TestExecutionSchema,
  BugReportSchema,
  TestReportSchema,
  AuditLogSchema,
];

// Database Migration Order (due to foreign key dependencies)
export const MigrationOrder = [
  'users',
  'registration_otps',
  'projects',
  'test_flows',
  'test_cases',
  'test_executions',
  'bug_reports',
  'test_reports',
  'audit_logs',
];

// Schema Descriptions for Documentation
export const SchemaDescriptions = {
  users: 'User authentication and authorization',
  registration_otps: 'Temporary OTP storage for user registration verification',
  projects: 'Website/application projects being tested',
  test_flows: 'User-defined testing flows and scenarios',
  test_cases: 'Auto-generated and manual test cases',
  test_executions: 'Test execution results and logs',
  bug_reports: 'Detailed bug reports with reproduction steps',
  test_reports: 'Generated CSV/PDF reports for stakeholders',
  audit_logs: 'System audit trail for compliance and debugging',
};
