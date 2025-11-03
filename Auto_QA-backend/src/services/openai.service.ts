/**
 * OpenAI Service for AI-powered test case generation
 * Handles communication with OpenAI API to generate comprehensive test cases
 */

import OpenAI from "openai";
import { logger } from "../utils/logger";
import { 
  TestCaseGenerationRequest,
  GeneratedTestCase,
  OpenAIServiceStatus
} from "../features/test-cases/interface";

export class OpenAIService {
  private openai: OpenAI | null = null;
  private initialized = false;

  constructor() {
    // Delay initialization to ensure env variables are loaded
    setTimeout(() => {
      this.initializeOpenAI();
    }, 100);
  }

  /**
   * Initialize OpenAI client
   */
  private initializeOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Debug logging
    logger.info('🔍 OpenAI initialization debug:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'undefined',
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('OPENAI'))
    });
    
    if (apiKey && apiKey.length > 0) {
      try {
        this.openai = new OpenAI({
          apiKey: apiKey,
        });
        logger.info('✅ OpenAI service initialized successfully', {
          model: 'gpt-4o-mini',
          provider: 'OpenAI'
        });
      } catch (error) {
        logger.error('❌ Failed to initialize OpenAI service:', error);
        this.openai = null;
      }
    } else {
      logger.info('ℹ️  OpenAI API key not configured, test case generation will use mock data', {
        envKeys: Object.keys(process.env).filter(key => key.includes('OPENAI')),
        nodeEnv: process.env.NODE_ENV
      });
    }
    
    this.initialized = true;
  }

  /**
   * Generate test cases using OpenAI based on user input
   */
  public async generateTestCases(request: TestCaseGenerationRequest): Promise<GeneratedTestCase[]> {
    // Ensure initialization is complete
    if (!this.initialized) {
      // Try to initialize immediately if not done yet
      this.initializeOpenAI();
    }

    if (!this.openai) {
      // Return mock test cases when OpenAI is not configured
      return this.generateMockTestCases(request);
    }

    try {
      const prompt = this.buildPrompt(request);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // More cost-effective than GPT-4 but better than GPT-3.5
        messages: [
          {
            role: "system",
            content: "You are the world's most thorough QA engineer and intelligent failure detection specialist. Your mission is to generate EVERY POSSIBLE test case AND intelligently predict WHERE functionality will break. You analyze systems like a detective, identifying weak points, failure patterns, and hidden defects. You generate exhaustive test suites that not only cover all scenarios but specifically target the most likely failure points. You think like both an attacker trying to break the system AND a user whose workflow might be disrupted. Your test cases expose bugs before they reach production. You have an uncanny ability to predict where software will fail based on architecture, user behavior, and system dependencies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1, // Lowest temperature for maximum consistency and comprehensiveness
        max_tokens: 4000, // Balanced for speed and comprehensive coverage
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      // Parse the response and extract test cases
      const testCases = this.parseOpenAIResponse(responseText);
      
      logger.info(`Generated ${testCases.length} test cases using OpenAI`, {
        websiteUrl: request.websiteUrl,
        moduleFlow: request.moduleFlow.substring(0, 50) + '...'
      });

      return testCases;

    } catch (error) {
      logger.error('Failed to generate test cases with OpenAI:', error);
      // Fallback to mock test cases on error
      return this.generateMockTestCases(request);
    }
  }

  /**
   * Build the prompt for OpenAI based on user input
   */
  private buildPrompt(request: TestCaseGenerationRequest): string {
    return `
Generate comprehensive test cases for a web application module with the following details:

**Website URL:** ${request.websiteUrl}
**Test Credentials:** Username: ${request.username}, Password: [PROTECTED]
**Module Flow:** ${request.moduleFlow}
${request.additionalNotes ? `**Additional Notes:** ${request.additionalNotes}` : ''}

GENERATE THE MOST COMPREHENSIVE, EXHAUSTIVE TEST SUITE POSSIBLE. NO LIMITS. NO RESTRICTIONS. 

**MANDATE**: Generate 100-200+ test cases. Cover EVERY SINGLE possible scenario, failure mode, edge case, boundary condition, attack vector, user interaction, system state, and integration point. Leave NOTHING untested.

**CRITICAL DIRECTIVE**: Think like a perfectionist QA engineer who wants to find EVERY possible bug. Analyze the module flow step-by-step and create test cases for:
- Every single user action possible
- Every single system response possible  
- Every single error condition possible
- Every single data combination possible
- Every single timing scenario possible
- Every single security vulnerability possible
- Every single performance bottleneck possible
- Every single integration failure possible

Cover EVERY scenario, edge case, and possibility including:

## FUNCTIONAL TESTING - COMPLETE COVERAGE
- **Happy Path Scenarios:** Every single step and variation in the main flow
- **Alternative Flows:** All possible different paths through the system
- **Data Validation:** Every input field, every validation rule, every format check
- **Business Logic:** All calculations, rules, conditions, and workflows
- **State Transitions:** Every possible state change and transition
- **User Interactions:** Every button, link, form, dropdown, checkbox, radio button
- **Data Flow:** Input validation, processing, storage, retrieval, display
- **Integration Points:** All API calls, database operations, external services

## NEGATIVE TESTING - ALL FAILURE SCENARIOS
- **Invalid Data Types:** Wrong types for every field (string vs number, etc.)
- **Invalid Formats:** Wrong email, phone, date, URL formats for every field
- **Missing Required Fields:** Every combination of missing required data
- **Empty Values:** Null, undefined, empty string for every field
- **Authorization Failures:** Invalid tokens, expired sessions, wrong permissions
- **Server Errors:** 400, 401, 403, 404, 500, 502, 503, 504 responses
- **Network Issues:** Timeouts, connection failures, slow responses
- **Database Errors:** Connection failures, constraint violations, deadlocks

## BOUNDARY & EDGE CASES - EVERY LIMIT
- **Character Limits:** Test 0, 1, max-1, max, max+1 characters for every field
- **Numerical Limits:** Min, max values for every number field
- **Date Boundaries:** Past dates, future dates, leap years, invalid dates
- **File Size Limits:** Empty files, 1 byte, max size, oversized files
- **Array Limits:** Empty arrays, single item, maximum items, too many items
- **Special Characters:** Every special character in every field
- **Unicode Testing:** Emojis, non-English characters, RTL text
- **SQL Injection:** Every possible SQL injection pattern
- **XSS Attempts:** Every type of XSS attack vector
- **Large Data Sets:** Maximum records, bulk operations, memory limits
- **Concurrent Operations:** Multiple users, race conditions, deadlocks

## SECURITY TESTING - ALL ATTACK VECTORS
- **Authentication Bypass:** Every possible way to bypass login
- **Session Management:** Session fixation, hijacking, timeout issues
- **CSRF Protection:** Cross-site request forgery attempts
- **Input Validation:** Every injection type (SQL, NoSQL, LDAP, OS, etc.)
- **Authorization:** Horizontal/vertical privilege escalation
- **Data Exposure:** Sensitive data in responses, logs, errors
- **Encryption:** Data at rest, in transit, key management
- **Password Security:** Brute force, dictionary attacks, weak passwords

## PERFORMANCE TESTING - ALL SCENARIOS
- **Load Testing:** 1, 10, 100, 1000+ concurrent users
- **Stress Testing:** Beyond normal capacity
- **Volume Testing:** Large amounts of data
- **Endurance Testing:** Extended periods of use
- **Spike Testing:** Sudden load increases
- **Memory Leaks:** Long-running operations
- **Database Performance:** Complex queries, large result sets

## USABILITY & ACCESSIBILITY - COMPLETE COVERAGE
- **Every Browser:** Chrome, Firefox, Safari, Edge, IE (all versions)
- **Every Device:** Desktop, tablet, mobile (all screen sizes)
- **Every OS:** Windows, Mac, Linux, iOS, Android
- **Accessibility:** Screen readers, keyboard navigation, color blindness
- **Internationalization:** All languages, currencies, time zones
- **Error Messages:** Every error condition, clarity, actionability

## INTEGRATION TESTING - ALL CONNECTIONS
- **API Integrations:** Every endpoint, every parameter combination
- **Database Operations:** CRUD operations, transactions, rollbacks
- **Third-party Services:** Payment gateways, email services, etc.
- **File Operations:** Upload, download, processing, storage
- **External Dependencies:** Service unavailability, version mismatches

## FAILURE DETECTION & BREAKPOINT ANALYSIS
- **Critical Path Analysis:** Identify the most important user journeys and test where they're most likely to fail
- **Dependency Failure Points:** Test what happens when each dependency (database, API, service) fails at each step
- **State Corruption Testing:** Verify system behavior when data gets into invalid states
- **Race Condition Detection:** Test concurrent operations that could cause data inconsistency
- **Memory Leak Detection:** Long-running operations that could exhaust system resources
- **Cascading Failure Testing:** How one component failure affects the entire system
- **Recovery Testing:** System's ability to recover from various failure states
- **Data Integrity Validation:** Ensure data remains consistent across all operations
- **Error Propagation Testing:** How errors are handled and communicated up the stack
- **Timeout and Retry Logic:** Test all timeout scenarios and retry mechanisms

## FUNCTIONAL BREAKDOWN DETECTION
- **Business Logic Flaws:** Test edge cases where business rules might conflict or fail
- **Workflow Interruption:** Test what happens when user workflows are interrupted at each step
- **Permission Boundary Testing:** Test functionality at the edges of user permissions
- **Data Format Corruption:** Test how system handles corrupted or malformed data at each processing step
- **Integration Point Failures:** Test each integration point under stress and failure conditions
- **Configuration Error Testing:** Test system behavior with various configuration errors
- **Version Compatibility Issues:** Test compatibility between different component versions
- **Resource Exhaustion:** Test functionality when system resources (CPU, memory, disk) are limited

For each test case, provide:
- **Test ID:** Format as TC001, TC002, etc.
- **Test Description:** Detailed step-by-step description with expected behavior
- **Test Endpoints:** Specific API endpoints, page URLs, or UI elements being tested
- **Comments:** Expected results, preconditions, test data requirements, or special notes

**FAILURE DETECTION METHODOLOGY:**
1. **Analyze the module flow** to identify the most complex/risky steps
2. **Identify all dependencies** (databases, APIs, services, files) and test their failure
3. **Map user journey breakpoints** where users are most likely to get stuck or frustrated
4. **Consider timing issues** (race conditions, timeouts, async operations)
5. **Think about state management** (what happens if data gets corrupted mid-process)
6. **Test system limits** (what breaks first when pushed to extremes)
7. **Consider real-world scenarios** (network issues, concurrent users, data corruption)

**FOCUSED TEST CASE GENERATION RULES:**
1. **COVER KEY SCENARIOS**: Happy path, edge cases, error conditions
2. **TEST CRITICAL FLOWS**: Focus on the most important user journeys
3. **VALIDATE INPUTS**: Test with valid, invalid, and boundary values
4. **CHECK INTEGRATIONS**: Test API calls, database operations, file uploads
5. **SECURITY BASICS**: Test for XSS, SQL injection, authentication issues
6. **USABILITY**: Test user experience, error messages, navigation
10. **COVER ALL TIME SCENARIOS**: Fast actions, slow actions, timeouts, retries

**PRACTICAL TEST GENERATION METHODOLOGY:**
- Generate 3-5 test cases for each step in the module flow
- Generate 5-8 test cases for each input field (valid, invalid, boundary, security)
- Generate 2-3 test cases for each button/action
- Generate 2-3 test cases for error conditions
- Generate 3-5 security test cases (XSS, injection, auth)
- Generate 2-3 performance test cases
- Generate 3-5 browser compatibility test cases

**TARGET:** Generate 25-40 focused, high-quality test cases that cover the most important scenarios efficiently. Focus on practical test cases that will catch real bugs.

Format your response as a JSON array of objects with these exact fields:
\`\`\`json
[
  {
    "testId": "TC001",
    "testDescription": "Step-by-step test description with specific actions and verifications...",
    "testEndpoints": "/api/endpoint1, /page/url2, #elementId",
    "comments": "Expected result, test data, preconditions, or cleanup notes..."
  }
]
\`\`\`

Focus on creating test cases that are:
- Immediately executable by QA engineers
- Include specific test data and examples
- Cover all possible user interactions and system responses
- Consider real-world usage scenarios and potential failure points
    `;
  }

  /**
   * Parse OpenAI response and extract test cases
   */
  private parseOpenAIResponse(responseText: string): GeneratedTestCase[] {
    try {
      // Look for JSON array in the response
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        // Try to find JSON without code blocks
        const lines = responseText.split('\n');
        const jsonLines = lines.filter(line => 
          line.trim().startsWith('{') || 
          line.trim().startsWith('[') || 
          line.trim().includes('"testId"')
        );
        
        if (jsonLines.length === 0) {
          throw new Error('No JSON found in response');
        }
      }

      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      const parsedData = JSON.parse(jsonText);

      // Validate and format the data
      if (Array.isArray(parsedData)) {
        return parsedData.map((item, index) => ({
          testId: item.testId || `TC${String(index + 1).padStart(3, '0')}`,
          testDescription: item.testDescription || item.description || 'Test description',
          testEndpoints: item.testEndpoints || item.endpoints || '',
          comments: item.comments || item.notes || item.expectedResult || ''
        }));
      }

      throw new Error('Response is not an array');

    } catch (error) {
      logger.error('Failed to parse OpenAI response:', error);
      // Return fallback test cases if parsing fails
      return this.generateMockTestCases({
        websiteUrl: 'Error parsing response',
        username: '',
        password: '',
        moduleFlow: 'Fallback test cases due to parsing error'
      });
    }
  }

  /**
   * Generate mock test cases when OpenAI is not available
   */
  private generateMockTestCases(request: TestCaseGenerationRequest): GeneratedTestCase[] {
    const mockTestCases: GeneratedTestCase[] = [
      // FUNCTIONAL TESTING - POSITIVE CASES
      {
        testId: "TC001",
        testDescription: `Verify successful login with valid credentials (${request.username}) on ${request.websiteUrl}. Navigate to login page, enter username and password, click login button, verify successful authentication and redirection to dashboard.`,
        testEndpoints: "/api/auth/login, /dashboard, /login",
        comments: "Expected: User authenticated successfully, JWT token generated, redirected to dashboard with welcome message"
      },
      {
        testId: "TC002",
        testDescription: `Execute complete module flow: ${request.moduleFlow}. Verify each step executes successfully and data persists correctly throughout the flow.`,
        testEndpoints: "/api/modules, /api/data, /workflow",
        comments: "Expected: All workflow steps complete successfully, data validation passes, final state achieved"
      },
      {
        testId: "TC003",
        testDescription: "Verify form submission with all required fields populated. Fill all mandatory fields with valid data, submit form, verify data is saved and success message displayed.",
        testEndpoints: "/api/submit, /form",
        comments: "Test data: Valid email, phone number, text fields within character limits. Expected: Form submitted successfully"
      },
      
      // FUNCTIONAL TESTING - ALTERNATIVE FLOWS  
      {
        testId: "TC004",
        testDescription: "Test alternative navigation paths to reach the same functionality. Use different menu options, breadcrumbs, and direct URLs to access the module.",
        testEndpoints: "/nav/menu, /breadcrumbs, /direct-url",
        comments: "Expected: All navigation paths lead to same functionality, state preserved across different access methods"
      },
      {
        testId: "TC005",
        testDescription: "Verify 'Remember Me' functionality during login. Login with 'Remember Me' checked, close browser, reopen and verify session persistence.",
        testEndpoints: "/api/auth/login, /api/auth/verify",
        comments: "Expected: Session persists after browser restart when 'Remember Me' is selected"
      },

      // NEGATIVE TESTING
      {
        testId: "TC006",
        testDescription: "Verify login failure with invalid username. Enter non-existent username with any password, attempt login.",
        testEndpoints: "/api/auth/login",
        comments: "Expected: Login fails, generic error message displayed, no indication if username exists, account lockout after 5 attempts"
      },
      {
        testId: "TC007",
        testDescription: "Verify login failure with correct username but wrong password. Use valid username with incorrect password.",
        testEndpoints: "/api/auth/login",
        comments: "Expected: Login fails, generic error message, attempt counter incremented, no password hints revealed"
      },
      {
        testId: "TC008",
        testDescription: "Test form submission with missing required fields. Submit form with empty mandatory fields and verify validation.",
        testEndpoints: "/api/submit, /form/validate",
        comments: "Expected: Form submission blocked, specific field validation errors displayed, focus set to first invalid field"
      },
      {
        testId: "TC009",
        testDescription: "Verify handling of server errors and network timeouts. Simulate server downtime during form submission.",
        testEndpoints: "/api/submit",
        comments: "Expected: Graceful error handling, user-friendly error message, option to retry, data preserved in form"
      },

      // EDGE CASES & BOUNDARY TESTING
      {
        testId: "TC010",
        testDescription: "Test maximum character limits for input fields. Enter text exceeding maximum allowed characters in each field.",
        testEndpoints: "/api/validate, /form",
        comments: "Test data: 256+ chars for text fields, 51+ for name fields. Expected: Input truncated or validation error shown"
      },
      {
        testId: "TC011",
        testDescription: "Test special characters and Unicode in input fields. Enter various special characters, emojis, and non-English text.",
        testEndpoints: "/api/submit, /form",
        comments: "Test data: !@#$%^&*()_+, émojis 🚀, 中文字符. Expected: Characters handled correctly or appropriate validation"
      },
      {
        testId: "TC012",
        testDescription: "Verify behavior with extremely large data sets. Upload or input maximum allowed data volume.",
        testEndpoints: "/api/upload, /api/bulk-data",
        comments: "Test data: Maximum file size, 10000+ records. Expected: System handles gracefully with progress indicators"
      },
      {
        testId: "TC013",
        testDescription: "Test concurrent user sessions. Open multiple browser sessions with same user account and perform actions simultaneously.",
        testEndpoints: "/api/auth/login, /api/session",
        comments: "Expected: Proper session management, data consistency maintained, appropriate conflict resolution"
      },
      {
        testId: "TC014",
        testDescription: "Cross-browser compatibility testing. Test the module flow on Chrome, Firefox, Safari, and Edge browsers.",
        testEndpoints: request.websiteUrl,
        comments: "Expected: Consistent functionality across all browsers, proper rendering, no JavaScript errors"
      },

      // SECURITY TESTING
      {
        testId: "TC015",
        testDescription: "Test SQL injection vulnerability. Attempt SQL injection patterns in login fields and form inputs.",
        testEndpoints: "/api/auth/login, /api/submit",
        comments: "Test data: '; DROP TABLE users; --, admin'--. Expected: Input sanitized, no database errors, security logs generated"
      },
      {
        testId: "TC016",
        testDescription: "Test XSS (Cross-Site Scripting) protection. Input JavaScript code in text fields and verify sanitization.",
        testEndpoints: "/api/submit, /form",
        comments: "Test data: <script>alert('XSS')</script>. Expected: Script tags escaped, no code execution, safe display"
      },
      {
        testId: "TC017",
        testDescription: "Verify session security and timeout. Test session expiration, token refresh, and unauthorized access attempts.",
        testEndpoints: "/api/auth/verify, /api/auth/refresh",
        comments: "Expected: Sessions expire after inactivity, secure token refresh, unauthorized requests blocked"
      },
      {
        testId: "TC018",
        testDescription: "Test password complexity requirements. Attempt to set passwords that don't meet security criteria.",
        testEndpoints: "/api/auth/change-password",
        comments: "Test data: '123', 'password', short passwords. Expected: Password policy enforced, clear requirements displayed"
      },

      // USABILITY & PERFORMANCE
      {
        testId: "TC019",
        testDescription: "Verify page load performance and responsiveness. Measure load times for critical pages and user interactions.",
        testEndpoints: request.websiteUrl + "/performance",
        comments: "Expected: Pages load within 3 seconds, smooth animations, responsive user interface"
      },
      {
        testId: "TC020",
        testDescription: "Test mobile responsiveness and touch interactions. Verify module functionality on mobile devices and tablets.",
        testEndpoints: request.websiteUrl,
        comments: "Expected: Mobile-friendly layout, touch-friendly buttons, proper scrolling, no horizontal overflow"
      },
      {
        testId: "TC021",
        testDescription: "Verify accessibility compliance. Test with screen readers, keyboard navigation, and accessibility tools.",
        testEndpoints: request.websiteUrl + "/accessibility",
        comments: "Expected: WCAG 2.1 compliance, proper ARIA labels, keyboard accessible, screen reader compatible"
      },
      {
        testId: "TC022",
        testDescription: "Test error message clarity and user guidance. Trigger various error conditions and verify message quality.",
        testEndpoints: "/api/errors, /form",
        comments: "Expected: Clear, actionable error messages, helpful suggestions, proper error codes, user-friendly language"
      },

      // ADDITIONAL FUNCTIONAL TESTING
      {
        testId: "TC023",
        testDescription: "Test form auto-save functionality. Fill out form partially, wait for auto-save trigger, refresh page and verify data persistence.",
        testEndpoints: "/api/auto-save, /form",
        comments: "Expected: Form data automatically saved at intervals, restored on page reload"
      },
      {
        testId: "TC024", 
        testDescription: "Verify drag and drop functionality. Test file uploads, sortable lists, and draggable UI elements.",
        testEndpoints: "/api/upload, /drag-drop",
        comments: "Expected: Smooth drag and drop, proper file handling, visual feedback during operations"
      },
      {
        testId: "TC025",
        testDescription: "Test real-time notifications and updates. Verify WebSocket connections, push notifications, live data updates.",
        testEndpoints: "/websocket, /notifications, /live-updates",
        comments: "Expected: Real-time communication works, notifications display correctly, data updates instantly"
      },

      // ADDITIONAL NEGATIVE TESTING
      {
        testId: "TC026",
        testDescription: "Test malformed JSON requests. Send invalid JSON syntax in API calls.",
        testEndpoints: "/api/*",
        comments: "Test data: {invalid json}, missing brackets. Expected: 400 error with clear message"
      },
      {
        testId: "TC027",
        testDescription: "Test API rate limiting. Send requests exceeding rate limits.",
        testEndpoints: "/api/*",
        comments: "Expected: 429 Too Many Requests error, proper rate limit headers, retry-after information"
      },
      {
        testId: "TC028",
        testDescription: "Test duplicate form submissions. Submit same form multiple times rapidly.",
        testEndpoints: "/api/submit",
        comments: "Expected: Duplicate detection, only one submission processed, proper user feedback"
      },

      // ADDITIONAL BOUNDARY TESTING
      {
        testId: "TC029",
        testDescription: "Test extremely long URLs. Create URLs exceeding browser and server limits.",
        testEndpoints: request.websiteUrl,
        comments: "Test data: 2048+ character URLs. Expected: Graceful handling, appropriate error messages"
      },
      {
        testId: "TC030",
        testDescription: "Test nested data structures. Send deeply nested JSON objects and arrays.",
        testEndpoints: "/api/complex-data",
        comments: "Test data: 100+ levels of nesting. Expected: Proper parsing or depth limit error"
      },
      {
        testId: "TC031",
        testDescription: "Test time zone edge cases. Test operations across daylight saving time changes.",
        testEndpoints: "/api/datetime",
        comments: "Test data: DST transition times, leap seconds. Expected: Correct time handling"
      },

      // ADDITIONAL SECURITY TESTING
      {
        testId: "TC032",
        testDescription: "Test LDAP injection vulnerabilities. Attempt LDAP injection in authentication fields.",
        testEndpoints: "/api/auth/ldap",
        comments: "Test data: *()(objectClass=*). Expected: Input sanitized, no LDAP queries executed"
      },
      {
        testId: "TC033",
        testDescription: "Test HTTP header injection. Attempt to inject malicious headers.",
        testEndpoints: "/api/*",
        comments: "Test data: \\r\\nSet-Cookie: admin=true. Expected: Headers properly escaped"
      },
      {
        testId: "TC034",
        testDescription: "Test file upload security. Upload malicious files, executables, oversized files.",
        testEndpoints: "/api/upload",
        comments: "Test data: .exe files, PHP shells, 0-byte files. Expected: File type validation, virus scanning"
      },

      // PERFORMANCE EXTREMES
      {
        testId: "TC035",
        testDescription: "Test memory exhaustion scenarios. Upload maximum file sizes, create large objects.",
        testEndpoints: "/api/upload, /api/large-data",
        comments: "Expected: Memory limits enforced, graceful degradation, no server crashes"
      },
      {
        testId: "TC036",
        testDescription: "Test database connection pooling. Exhaust all database connections.",
        testEndpoints: "/api/db-intensive",
        comments: "Expected: Connection pool management, proper queuing, timeout handling"
      },

      // BROWSER-SPECIFIC TESTING
      {
        testId: "TC037",
        testDescription: "Test Internet Explorer compatibility. Verify functionality on IE 11 and Edge legacy.",
        testEndpoints: request.websiteUrl,
        comments: "Expected: Polyfills work, no JavaScript errors, acceptable degradation"
      },
      {
        testId: "TC038",
        testDescription: "Test JavaScript disabled scenarios. Verify graceful degradation without JS.",
        testEndpoints: request.websiteUrl,
        comments: "Expected: Core functionality available, proper noscript fallbacks"
      },

      // INTEGRATION EXTREMES
      {
        testId: "TC039",
        testDescription: "Test third-party service failures. Simulate external API downtime.",
        testEndpoints: "/api/external-services",
        comments: "Expected: Graceful fallback, proper error handling, service recovery"
      },
      {
        testId: "TC040",
        testDescription: "Test database transaction rollbacks. Force transaction failures and verify rollback.",
        testEndpoints: "/api/transactions",
        comments: "Expected: Data consistency maintained, proper rollback, no partial commits"
      },

      // ACCESSIBILITY EXTREMES
      {
        testId: "TC041",
        testDescription: "Test with screen reader software. Verify JAWS, NVDA, and VoiceOver compatibility.",
        testEndpoints: request.websiteUrl,
        comments: "Expected: Proper ARIA labels, logical tab order, clear announcements"
      },
      {
        testId: "TC042",
        testDescription: "Test color contrast compliance. Verify WCAG AA/AAA color contrast ratios.",
        testEndpoints: request.websiteUrl,
        comments: "Expected: 4.5:1 contrast ratio minimum, color not sole information method"
      },

      // MOBILE-SPECIFIC TESTING
      {
        testId: "TC043",
        testDescription: "Test mobile gesture support. Verify swipe, pinch, rotate gestures.",
        testEndpoints: request.websiteUrl,
        comments: "Expected: Natural gesture support, proper touch targets, no accidental activations"
      },
      {
        testId: "TC044",
        testDescription: "Test offline functionality. Verify service worker behavior and offline storage.",
        testEndpoints: request.websiteUrl,
        comments: "Expected: Offline mode available, data sync on reconnection, proper caching"
      },

      // INTERNATIONALIZATION TESTING
      {
        testId: "TC045",
        testDescription: "Test right-to-left (RTL) language support. Verify Arabic, Hebrew layout handling.",
        testEndpoints: request.websiteUrl,
        comments: "Expected: Proper RTL layout, text direction, mirrored UI elements"
      },
      {
        testId: "TC046",
        testDescription: "Test currency and number formatting. Verify locale-specific formatting.",
        testEndpoints: "/api/localization",
        comments: "Expected: Proper currency symbols, decimal separators, thousand separators"
      },

      // DATA INTEGRITY TESTING
      {
        testId: "TC047",
        testDescription: "Test data backup and recovery. Simulate data corruption and recovery scenarios.",
        testEndpoints: "/api/backup",
        comments: "Expected: Regular backups, successful recovery, data integrity verification"
      },
      {
        testId: "TC048",
        testDescription: "Test audit trail functionality. Verify all user actions are properly logged.",
        testEndpoints: "/api/audit",
        comments: "Expected: Complete audit trail, tamper-proof logs, proper retention policies"
      },

      // API VERSION TESTING
      {
        testId: "TC049",
        testDescription: "Test API version compatibility. Send requests with different API version headers.",
        testEndpoints: "/api/v1, /api/v2",
        comments: "Expected: Proper version handling, backward compatibility, deprecation notices"
      },
      {
        testId: "TC050",
        testDescription: "Test webhook delivery and retry logic. Verify webhook failure handling.",
        testEndpoints: "/api/webhooks",
        comments: "Expected: Reliable delivery, exponential backoff, dead letter queue"
      },

      // INTELLIGENT FAILURE DETECTION TESTS
      {
        testId: "TC051",
        testDescription: "BREAKPOINT ANALYSIS: Test module flow interruption at each critical step. Simulate browser crash, network disconnect, and tab closure during each phase of the workflow.",
        testEndpoints: request.websiteUrl + "/workflow-steps",
        comments: "FAILURE DETECTION: Verify data persistence, session recovery, and user notification at each interruption point"
      },
      {
        testId: "TC052", 
        testDescription: "DEPENDENCY FAILURE CASCADE: Systematically fail each external dependency (database, API, email service) and verify how failures propagate through the system.",
        testEndpoints: "/api/dependencies",
        comments: "FAILURE DETECTION: Map which functionality breaks when each dependency fails, verify graceful degradation"
      },
      {
        testId: "TC053",
        testDescription: "SILENT FAILURE DETECTION: Test scenarios where operations appear successful but actually fail (database commits that rollback, email sends that bounce, file uploads that corrupt).",
        testEndpoints: "/api/silent-failures",
        comments: "FAILURE DETECTION: Verify success confirmations are accurate, implement health checks for critical operations"
      },
      {
        testId: "TC054",
        testDescription: "STATE CORRUPTION ANALYSIS: Inject invalid data into system state at various points and verify system behavior and recovery mechanisms.",
        testEndpoints: "/api/state-management",
        comments: "FAILURE DETECTION: Test state validation, corruption detection, automatic state repair mechanisms"
      },
      {
        testId: "TC055",
        testDescription: "CRITICAL PATH STRESS TEST: Identify the 3 most important user journeys and stress test them with maximum concurrent users, data corruption, and system failures.",
        testEndpoints: request.websiteUrl + "/critical-paths",
        comments: "FAILURE DETECTION: Find the breaking point of most important functionality, implement monitoring and alerts"
      },
      {
        testId: "TC056",
        testDescription: "RESOURCE EXHAUSTION DETECTION: Gradually consume system resources (memory, CPU, disk, connections) and identify at what point functionality degrades or fails.",
        testEndpoints: "/api/resources",
        comments: "FAILURE DETECTION: Establish resource thresholds, implement automatic scaling or graceful degradation"
      },
      {
        testId: "TC057",
        testDescription: "TIMING VULNERABILITY ANALYSIS: Test race conditions between concurrent operations, async callback timing, and time-sensitive operations.",
        testEndpoints: "/api/timing-sensitive",
        comments: "FAILURE DETECTION: Identify race conditions, implement proper locking, verify transaction isolation"
      },
      {
        testId: "TC058",
        testDescription: "ERROR RECOVERY VALIDATION: After each type of failure, test if the system can fully recover to operational state without manual intervention.",
        testEndpoints: "/api/recovery",
        comments: "FAILURE DETECTION: Verify automatic recovery mechanisms, health checks, and system self-healing capabilities"
      },
      {
        testId: "TC059",
        testDescription: "USER WORKFLOW BREAKDOWN ANALYSIS: Map every step where users commonly get confused, stuck, or abandon the workflow in the described module flow.",
        testEndpoints: request.websiteUrl + "/user-experience",
        comments: "FAILURE DETECTION: Identify UX friction points, implement user guidance, reduce abandonment rates"
      },
      {
        testId: "TC060",
        testDescription: "INTEGRATION POINT FAILURE MAPPING: Test each integration point under various failure conditions and map how failures affect the overall user experience.",
        testEndpoints: "/api/integrations",
        comments: "FAILURE DETECTION: Create integration health dashboard, implement circuit breakers, plan fallback strategies"
      }
    ];

    // Add more test cases to reach 100+ comprehensive coverage
    const additionalTestCases: GeneratedTestCase[] = [];
    
    // Generate test cases for each character in common inputs
    const testInputs = ['email', 'password', 'username', 'phone', 'address', 'creditcard', 'ssn', 'zip'];
    testInputs.forEach((inputType, index) => {
      // Test each input with various invalid characters
      const invalidChars = ['<', '>', '"', "'", '&', '\\', '/', '\n', '\t', '\r', '\0', '\x00', '🚀', '中文', 'ñ', 'é'];
      invalidChars.forEach((char, charIndex) => {
        additionalTestCases.push({
          testId: `TC${String(mockTestCases.length + additionalTestCases.length + 1).padStart(3, '0')}`,
          testDescription: `Test ${inputType} field with invalid character '${char}'. Input the character in ${inputType} field and verify proper validation and sanitization.`,
          testEndpoints: `/api/validate, /form/${inputType}`,
          comments: `Test data: ${char} character. Expected: Proper validation, character escaping, no XSS vulnerability`
        });
      });
      
      // Test length boundaries for each input
      [0, 1, 2, 255, 256, 1000, 10000].forEach(length => {
        additionalTestCases.push({
          testId: `TC${String(mockTestCases.length + additionalTestCases.length + 1).padStart(3, '0')}`,
          testDescription: `Test ${inputType} field with ${length} character input. Generate string of exactly ${length} characters and test validation.`,
          testEndpoints: `/api/validate, /form/${inputType}`,
          comments: `Test data: ${length} character string. Expected: Proper length validation, appropriate error messages`
        });
      });
    });

    // Generate browser-specific test cases
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'IE11', 'Opera'];
    const devices = ['Desktop', 'Tablet', 'Mobile', 'iPhone', 'Android', 'iPad'];
    browsers.forEach(browser => {
      devices.forEach(device => {
        additionalTestCases.push({
          testId: `TC${String(mockTestCases.length + additionalTestCases.length + 1).padStart(3, '0')}`,
          testDescription: `Test complete module flow on ${browser} browser with ${device} device. Execute all functionality and verify compatibility.`,
          testEndpoints: request.websiteUrl,
          comments: `Expected: Full functionality maintained, responsive design, no browser-specific errors`
        });
      });
    });

    // Generate performance test cases with specific metrics
    const performanceScenarios = [
      { users: 1, desc: 'single user baseline' },
      { users: 10, desc: 'small team usage' },
      { users: 50, desc: 'medium team usage' },
      { users: 100, desc: 'large team usage' },
      { users: 500, desc: 'department usage' },
      { users: 1000, desc: 'company-wide usage' },
      { users: 5000, desc: 'peak load scenario' }
    ];
    
    performanceScenarios.forEach(scenario => {
      additionalTestCases.push({
        testId: `TC${String(mockTestCases.length + additionalTestCases.length + 1).padStart(3, '0')}`,
        testDescription: `Performance test with ${scenario.users} concurrent users (${scenario.desc}). Simulate ${scenario.users} users executing the module flow simultaneously.`,
        testEndpoints: `/api/performance, ${request.websiteUrl}`,
        comments: `Expected: Response time < 3 seconds, no errors, proper resource utilization, graceful degradation if needed`
      });
    });

    // Combine all test cases
    const allTestCases = [...mockTestCases, ...additionalTestCases];

    logger.info(`Generated ${allTestCases.length} TRULY EXHAUSTIVE mock test cases covering ALL scenarios`, {
      websiteUrl: request.websiteUrl,
      coverage: 'Ultra-comprehensive: Functional, Negative, Boundary, Security, Performance, Integration, Accessibility, Mobile, I18n, Data Integrity, Browser Compatibility, Character Testing, Performance Scaling'
    });

    return allTestCases;
  }

  /**
   * Check if OpenAI service is available
   */
  public isAvailable(): boolean {
    // Ensure initialization is complete
    if (!this.initialized) {
      this.initializeOpenAI();
    }
    return this.openai !== null;
  }

  /**
   * Get service status
   */
  public getStatus(): OpenAIServiceStatus {
    // Ensure initialization is complete
    if (!this.initialized) {
      this.initializeOpenAI();
    }
    return {
      available: this.openai !== null,
      provider: this.openai ? 'OpenAI GPT-4o-mini' : 'Mock Generator'
    };
  }

  /**
   * Reinitialize the OpenAI service (useful for when env vars are loaded later)
   */
  public reinitialize(): void {
    this.initialized = false;
    this.openai = null;
    this.initializeOpenAI();
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();
