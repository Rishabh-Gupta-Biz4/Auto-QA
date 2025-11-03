# SQL Injection Prevention Guide

## 🛡️ Overview

This document provides comprehensive guidance on SQL injection prevention in the Auto QA application. SQL injection is one of the most dangerous web application vulnerabilities and can lead to unauthorized data access, data modification, or complete system compromise.

## 🎯 Implementation Status

✅ **SECURE** - Your application now has comprehensive SQL injection protection!

### What We've Implemented:

1. ✅ **Parameterized Queries** - All database queries use prepared statements
2. ✅ **Input Sanitization** - Comprehensive input validation and sanitization
3. ✅ **SQL Injection Detection** - Real-time detection and blocking of injection attempts
4. ✅ **Query Validation** - Safe query building with whitelisting
5. ✅ **Security Audit Tool** - Automated vulnerability scanning
6. ✅ **Security Middleware** - Application-wide protection

## 📚 Table of Contents

1. [What is SQL Injection](#what-is-sql-injection)
2. [How We Prevent It](#how-we-prevent-it)
3. [Using the Security Tools](#using-the-security-tools)
4. [Best Practices](#best-practices)
5. [Examples](#examples)
6. [Security Audit](#security-audit)
7. [Testing](#testing)

---

## What is SQL Injection?

SQL injection is a code injection technique that exploits security vulnerabilities in an application's database layer. Attackers can inject malicious SQL commands into input fields to:

- **Read sensitive data** (passwords, credit cards, personal information)
- **Modify data** (update, delete, or insert records)
- **Execute administrative operations** (shut down the database)
- **Recover files** from the database server
- **Execute commands** on the operating system

### Example Attack:

```sql
-- Normal query
SELECT * FROM users WHERE email = 'user@example.com' AND password = 'password123';

-- SQL Injection attack
SELECT * FROM users WHERE email = 'admin@example.com' OR '1'='1' -- ' AND password = '';

-- Result: Bypasses authentication by making the WHERE clause always true
```

---

## How We Prevent It

### 1. **Parameterized Queries (Primary Defense)**

**What it does:** Separates SQL code from data, preventing user input from being interpreted as SQL commands.

**Example:**

❌ **INSECURE** (Never do this):
```typescript
// String interpolation - VULNERABLE!
const query = `SELECT * FROM users WHERE email = '${email}'`;
await db.execute(query);

// String concatenation - VULNERABLE!
const query = "SELECT * FROM users WHERE email = '" + email + "'";
await db.execute(query);
```

✅ **SECURE** (Always do this):
```typescript
// Parameterized query - SAFE!
const query = 'SELECT * FROM users WHERE email = ?';
await db.execute(query, [email]);
```

### 2. **Input Sanitization**

**Location:** `src/utils/input-sanitizer.ts`

**What it does:** Validates and cleans user input before processing.

**Usage:**

```typescript
import { InputSanitizer } from '@/utils/input-sanitizer';

// Sanitize email
const cleanEmail = InputSanitizer.sanitizeEmail(userInput);

// Sanitize string
const cleanString = InputSanitizer.sanitizeString(userInput);

// Detect SQL injection attempts
if (InputSanitizer.detectSQLInjection(userInput)) {
  throw new Error('Invalid input detected');
}

// Sanitize entire object
const cleanData = InputSanitizer.sanitizeObject(requestBody, {
  detectInjection: true,
  detectXSS: true
});
```

### 3. **SQL Injection Detection Middleware**

**Location:** `src/middleware/sql-injection-guard.ts`

**What it does:** Automatically scans all incoming requests for SQL injection attempts.

**Configuration in App.ts:**

```typescript
import { securityGuard } from './middleware/sql-injection-guard';

app.use(securityGuard({
  strictMode: true,          // Block suspicious requests
  checkQuery: true,          // Check query parameters
  checkBody: true,           // Check request body
  checkParams: true,         // Check URL parameters
  skipFields: ['password'],  // Skip password fields
  logAttempts: true          // Log attack attempts
}));
```

**What happens when an attack is detected:**
1. Attack is logged with details (IP, timestamp, suspicious input)
2. Request is blocked with 400 error
3. User receives "Invalid input detected" message
4. Security team is alerted via logs

### 4. **Query Validation Helpers**

**Location:** `src/utils/query-validator.ts`

**What it does:** Provides safe query building with automatic validation.

**Usage:**

```typescript
import { QueryValidator } from '@/utils/query-validator';

// Build safe SELECT query
const { query, params } = QueryValidator.buildSelectQuery({
  table: 'users',
  columns: ['id', 'name', 'email'],
  where: { id: userId },
  orderBy: 'created_at',
  orderDirection: 'DESC',
  limit: 10
});

// Build safe INSERT query
const { query, params } = QueryValidator.buildInsertQuery({
  table: 'users',
  data: { name: 'John', email: 'john@example.com' }
});

// Build safe UPDATE query
const { query, params } = QueryValidator.buildUpdateQuery({
  table: 'users',
  data: { name: 'John Doe' },
  where: { id: userId }
});
```

**Features:**
- ✅ Table name whitelisting
- ✅ Column name validation
- ✅ Automatic identifier escaping
- ✅ Safe LIMIT and OFFSET handling
- ✅ LIKE clause protection

### 5. **Security Audit Tool**

**Location:** `src/utils/security-audit.ts`

**What it does:** Scans codebase for potential SQL injection vulnerabilities.

**Usage:**

```typescript
import { runSecurityAudit } from '@/utils/security-audit';

// Run audit
const auditor = await runSecurityAudit('./src');

// Get results
const issues = auditor.getIssues();
const criticalIssues = auditor.getIssuesBySeverity('critical');

// Generate report
auditor.printReport();

// Save report to file
await auditor.saveReport('./security-audit-report.txt');
```

---

## Using the Security Tools

### InputSanitizer Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `sanitizeString(input)` | Clean string input | `const clean = InputSanitizer.sanitizeString(userInput);` |
| `sanitizeEmail(email)` | Validate and clean email | `const email = InputSanitizer.sanitizeEmail(input);` |
| `sanitizeURL(url)` | Validate and clean URL | `const url = InputSanitizer.sanitizeURL(input);` |
| `sanitizeInteger(num)` | Parse and validate integer | `const id = InputSanitizer.sanitizeInteger(input);` |
| `sanitizeIdentifier(name)` | Sanitize table/column name | `const table = InputSanitizer.sanitizeIdentifier(input);` |
| `detectSQLInjection(input)` | Check for SQL injection | `if (InputSanitizer.detectSQLInjection(input)) { ... }` |
| `sanitizeObject(obj)` | Clean entire object | `const clean = InputSanitizer.sanitizeObject(data);` |

### Security Guard Middleware

**Apply to specific routes:**

```typescript
import { sqlInjectionGuard, xssGuard, securityGuard } from '@/middleware/sql-injection-guard';

// SQL injection only
router.post('/api/data', sqlInjectionGuard(), handleData);

// XSS only
router.post('/api/comment', xssGuard(), handleComment);

// Both (recommended)
router.post('/api/user', securityGuard(), handleUser);
```

**Custom configuration:**

```typescript
router.post('/api/sensitive', securityGuard({
  strictMode: true,
  skipFields: ['password', 'token'],
  logAttempts: true,
  errorMessage: 'Security violation detected'
}), handleSensitive);
```

---

## Best Practices

### ✅ DO:

1. **Always use parameterized queries**
   ```typescript
   await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
   ```

2. **Validate all user input**
   ```typescript
   const id = InputSanitizer.sanitizeInteger(req.params.id);
   ```

3. **Use whitelisting for identifiers**
   ```typescript
   const table = QueryValidator.validateTableName(tableName);
   ```

4. **Sanitize before processing**
   ```typescript
   const cleanData = InputSanitizer.sanitizeObject(req.body);
   ```

5. **Log security events**
   ```typescript
   logger.warn('SQL injection attempt detected', { ip, input });
   ```

### ❌ DON'T:

1. **Never use string interpolation in queries**
   ```typescript
   // ❌ NEVER DO THIS!
   const query = `SELECT * FROM users WHERE email = '${email}'`;
   ```

2. **Never concatenate user input into SQL**
   ```typescript
   // ❌ NEVER DO THIS!
   const query = "SELECT * FROM " + tableName + " WHERE id = " + userId;
   ```

3. **Never trust user input**
   ```typescript
   // ❌ Don't assume input is safe
   const query = 'SELECT * FROM ' + req.query.table; // DANGEROUS!
   ```

4. **Never skip validation**
   ```typescript
   // ❌ Always validate
   const id = req.params.id; // What if it's "1 OR 1=1"?
   ```

---

## Examples

### Example 1: Secure User Authentication

```typescript
import { InputSanitizer } from '@/utils/input-sanitizer';
import { DatabaseUtils } from '@/utils/database';

async function authenticateUser(email: string, password: string) {
  try {
    // 1. Sanitize input
    const cleanEmail = InputSanitizer.sanitizeEmail(email);
    
    // 2. Use parameterized query
    const users = await DatabaseUtils.executeQuery<any[]>(
      'SELECT * FROM users WHERE email = ? AND is_active = true',
      [cleanEmail]
    );
    
    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    // 3. Verify password (hashed)
    const isValid = await bcrypt.compare(password, users[0].password);
    
    return isValid ? users[0] : null;
  } catch (error) {
    logger.error('Authentication error:', error);
    throw error;
  }
}
```

### Example 2: Secure Search with LIKE

```typescript
import { QueryValidator } from '@/utils/query-validator';
import { DatabaseUtils } from '@/utils/database';

async function searchUsers(searchTerm: string) {
  // 1. Escape LIKE wildcards
  const { condition, value } = QueryValidator.buildLikeCondition(
    'name',
    searchTerm,
    'contains'
  );
  
  // 2. Use parameterized query
  const users = await DatabaseUtils.executeQuery<any[]>(
    `SELECT id, name, email FROM users WHERE ${condition}`,
    [value]
  );
  
  return users;
}
```

### Example 3: Secure Dynamic Query Building

```typescript
import { QueryValidator } from '@/utils/query-validator';
import { DatabaseUtils } from '@/utils/database';

async function getUsersWithFilters(filters: any) {
  // 1. Build safe query with validation
  const { query, params } = QueryValidator.buildSelectQuery({
    table: 'users',
    columns: ['id', 'name', 'email', 'created_at'],
    where: {
      role: filters.role,
      is_active: true
    },
    orderBy: filters.sortBy || 'created_at',
    orderDirection: filters.sortOrder || 'DESC',
    limit: filters.limit || 10,
    offset: filters.offset || 0
  });
  
  // 2. Execute safe query
  const users = await DatabaseUtils.executeQuery<any[]>(query, params);
  
  return users;
}
```

### Example 4: Secure Batch Insert

```typescript
import { InputSanitizer } from '@/utils/input-sanitizer';
import { DatabaseUtils } from '@/utils/database';

async function createMultipleUsers(usersData: any[]) {
  // 1. Sanitize all input
  const sanitizedUsers = usersData.map(user => 
    InputSanitizer.sanitizeObject(user, {
      detectInjection: true
    })
  );
  
  // 2. Use transaction for safety
  await DatabaseUtils.executeTransaction(async (connection) => {
    for (const user of sanitizedUsers) {
      // 3. Use parameterized queries
      await connection.execute(
        'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
        [user.name, user.email, user.role]
      );
    }
  });
}
```

---

## Security Audit

### Running the Security Audit

1. **Via Code:**
   ```typescript
   import { runSecurityAudit } from '@/utils/security-audit';
   
   const auditor = await runSecurityAudit('./src');
   auditor.printReport();
   ```

2. **Create CLI Script:**
   Create `scripts/security-audit.ts`:
   ```typescript
   import { runSecurityAudit } from '../src/utils/security-audit';
   
   async function main() {
     const auditor = await runSecurityAudit('./src');
     auditor.printReport();
     await auditor.saveReport('./security-audit-report.txt');
     
     const criticalIssues = auditor.getIssuesBySeverity('critical');
     if (criticalIssues.length > 0) {
       console.error(`❌ Found ${criticalIssues.length} critical issues!`);
       process.exit(1);
     }
   }
   
   main().catch(console.error);
   ```

3. **Add to package.json:**
   ```json
   {
     "scripts": {
       "security:audit": "ts-node scripts/security-audit.ts"
     }
   }
   ```

4. **Run audit:**
   ```bash
   npm run security:audit
   ```

### Audit Report Example:

```
================================================================================
                      SECURITY AUDIT REPORT
================================================================================

Total Issues Found: 2

  🔴 Critical: 1
  🟠 High:     1
  🟡 Medium:   0
  🟢 Low:      0

--------------------------------------------------------------------------------
CRITICAL SEVERITY ISSUES (1)
--------------------------------------------------------------------------------

1. String interpolation in SQL query
   File: src/features/user/service.ts
   Line: 45
   Type: sql-injection
   Code: const query = `SELECT * FROM users WHERE id = ${userId}`;
   Fix:  Use parameterized queries with ? placeholders

--------------------------------------------------------------------------------
HIGH SEVERITY ISSUES (1)
--------------------------------------------------------------------------------

1. Unsanitized user input rendered as HTML
   File: src/features/comment/controller.ts
   Line: 78
   Type: xss
   Code: res.send(`<div>${req.body.comment}</div>`);
   Fix:  Sanitize input before rendering

================================================================================
```

---

## Testing

### Test SQL Injection Protection

**Test 1: Basic Injection**
```bash
curl -X POST http://localhost:3001/api/v1/test \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com OR 1=1 --"}'
```
Expected: 400 Bad Request - "Invalid input detected"

**Test 2: UNION-based Injection**
```bash
curl -X POST http://localhost:3001/api/v1/test \
  -H "Content-Type: application/json" \
  -d '{"search": "test UNION SELECT password FROM users--"}'
```
Expected: 400 Bad Request - "Invalid input detected"

**Test 3: Time-based Injection**
```bash
curl -X POST http://localhost:3001/api/v1/test \
  -H "Content-Type: application/json" \
  -d '{"id": "1; SLEEP(10)--"}'
```
Expected: 400 Bad Request - "Invalid input detected"

**Test 4: Normal Input**
```bash
curl -X POST http://localhost:3001/api/v1/test \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```
Expected: 200 OK - Normal response

---

## Monitoring & Logging

All SQL injection attempts are logged:

```json
{
  "level": "warn",
  "message": "SQL Injection attempt detected",
  "ip": "192.168.1.1",
  "method": "POST",
  "path": "/api/v1/login",
  "suspiciousInputs": [
    {
      "location": "body",
      "field": "email",
      "valuePreview": "admin@example.com OR 1=1 --"
    }
  ],
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-10-16T10:30:45.123Z"
}
```

**View logs:**
```bash
# View combined logs
tail -f logs/combined.log

# View error logs only
tail -f logs/error.log

# Search for security events
grep "SQL Injection attempt" logs/combined.log
```

---

## Quick Reference

### Security Checklist

- [ ] All database queries use parameterized statements
- [ ] User input is validated before processing
- [ ] Identifiers (tables/columns) are whitelisted
- [ ] Security middleware is enabled
- [ ] Security audit runs regularly
- [ ] Logs are monitored for attack attempts
- [ ] Error messages don't reveal database structure
- [ ] Least privilege principle applied to database user

### Emergency Response

If you detect a SQL injection attack:

1. **Check logs** for attack details
2. **Block attacker IP** in firewall/rate limiter
3. **Review affected endpoints** for vulnerabilities
4. **Run security audit** to find similar issues
5. **Update code** with proper sanitization
6. **Test fix** thoroughly
7. **Deploy fix** immediately
8. **Monitor logs** for repeat attempts
9. **Document incident** for future reference

---

## Additional Resources

- [OWASP SQL Injection Guide](https://owasp.org/www-community/attacks/SQL_Injection)
- [OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [MySQL Prepared Statements](https://dev.mysql.com/doc/refman/8.0/en/sql-prepared-statements.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## Support

For questions or issues:
- Review this guide
- Check application logs
- Run security audit
- Contact security team

**Remember:** Security is not a feature, it's a requirement. Always validate, always sanitize, always use parameterized queries!



