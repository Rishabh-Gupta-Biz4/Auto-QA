/**
 * Quick Launch Page Component
 * AI-powered test case generation based on website URL, credentials, and flow description
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useAppSelector } from '@/redux/hooks';
import DashboardLayout from '@/components/dashboard-layout';
import * as XLSX from 'xlsx';
import styles from './quick-launch.module.scss';

interface QuickLaunchFormData {
  websiteUrl: string;
  username: string;
  password: string;
  moduleFlow: string;
  additionalNotes: string;
}

interface TestCase {
  testId: string;
  testDescription: string;
  testEndpoints: string;
  comments: string;
}

interface ExecutionSummary {
  passed: number;
  failed: number;
  successRate: number;
}

interface ExecutionResults {
  summary: ExecutionSummary;
  [key: string]: unknown;
}

interface FormErrors {
  websiteUrl?: string;
  username?: string;
  password?: string;
  moduleFlow?: string;
  general?: string;
}

export default function QuickLaunchPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const token = useAppSelector((state) => state.auth.token); // Get token from Redux
  
  const [formData, setFormData] = useState<QuickLaunchFormData>({
    websiteUrl: '',
    username: '',
    password: '',
    moduleFlow: '',
    additionalNotes: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<ExecutionResults | null>(null);
  
  // Ref for auto-scrolling to test cases section
  const testCasesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to test cases when they are generated
  useEffect(() => {
    if (testCases.length > 0 && testCasesRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        testCasesRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [testCases]);

  // Show loading state
  if (authLoading) {
    return (
      <div className={styles.loadingState}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Website URL validation
    if (!formData.websiteUrl) {
      newErrors.websiteUrl = 'Website URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Please enter a valid URL (starting with http:// or https://)';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    // Module flow validation
    if (!formData.moduleFlow) {
      newErrors.moduleFlow = 'Module flow description is required';
    } else if (formData.moduleFlow.length < 20) {
      newErrors.moduleFlow = 'Please provide a more detailed flow description (at least 20 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const generateTestCases = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:3001/api/v1/test-cases/generate-test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          username: formData.username,
          password: formData.password,
          moduleFlow: formData.moduleFlow,
          additionalNotes: formData.additionalNotes
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTestCases(data.data.testCases);
        setShowResults(true);
      } else {
        setErrors({ general: data.message || 'Failed to generate test cases. Please try again.' });
      }
    } catch (error) {
      console.error('Test case generation error:', error);
      setErrors({ general: 'Unable to connect to server. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestCaseEdit = (index: number, field: keyof TestCase, value: string) => {
    setTestCases(prev => prev.map((testCase, i) => 
      i === index ? { ...testCase, [field]: value } : testCase
    ));
  };

  const addNewTestCase = () => {
    const newTestCase: TestCase = {
      testId: `TC${String(testCases.length + 1).padStart(3, '0')}`,
      testDescription: '',
      testEndpoints: '',
      comments: ''
    };
    setTestCases(prev => [...prev, newTestCase]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== index));
  };

  // Execute test cases function
  const executeTestCases = async () => {
    if (testCases.length === 0) {
      alert('No test cases to execute');
      return;
    }

    try {
      setIsExecuting(true);
      
      if (!token) {
        alert('Please login to continue');
        return;
      }

      const response = await fetch('http://localhost:3001/api/v1/test-cases/execute-test-cases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          username: formData.username,
          password: formData.password,
          testCases: testCases,
          projectName: `Auto Test Execution - ${new Date().toLocaleDateString()}`,
          moduleFlow: formData.moduleFlow,
          additionalNotes: formData.additionalNotes
        }),
      });

      const result = await response.json();

      if (result.success) {
        setExecutionResults(result.data);
        alert(`🎉 Test Execution Complete!\n\n📊 Results Summary:\n✅ Passed: ${result.data.summary.passed}\n❌ Failed: ${result.data.summary.failed}\n📈 Success Rate: ${result.data.summary.successRate}%\n\n🔄 Check the dashboard for detailed metrics and graphs!`);
        console.log('Execution results:', result.data);
      } else {
        alert(`Failed to execute test cases: ${result.message}`);
      }
    } catch (error) {
      console.error('Execute test cases error:', error);
      alert('Failed to execute test cases. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  // Export test cases to Excel
  const exportToExcel = () => {
    if (testCases.length === 0) {
      alert('No test cases to export. Please generate test cases first.');
      return;
    }

    // Prepare data for Excel export
    const excelData = testCases.map((testCase, index) => ({
      'Sr. No.': index + 1,
      'Test ID': testCase.testId,
      'Test Description': testCase.testDescription,
      'Test Endpoints': testCase.testEndpoints,
      'Comments/Expected Results': testCase.comments,
      'Priority': 'Medium', // Default priority
      'Test Type': 'Functional', // Default type
      'Created Date': new Date().toLocaleDateString(),
      'Status': 'Ready for Execution'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 8 },  // Sr. No.
      { wch: 12 }, // Test ID
      { wch: 50 }, // Test Description
      { wch: 30 }, // Test Endpoints
      { wch: 40 }, // Comments
      { wch: 12 }, // Priority
      { wch: 15 }, // Test Type
      { wch: 15 }, // Created Date
      { wch: 20 }  // Status
    ];

    // Add header styling (optional)
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:I1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } }
      };
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Cases');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `AUTO-QA_Test_Cases_${timestamp}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
    
    // Show success message
    alert(`✅ Test cases exported successfully!\n\n📁 File: ${filename}\n📊 Total test cases: ${testCases.length}\n\n💾 Check your Downloads folder.`);
  };

  return (
    <DashboardLayout
      title="Quick Launch"
      subtitle="Generate AI-powered test cases for your website modules"
      user={user || undefined}
    >
      <div className={styles.quickLaunchContainer}>
        
        {!showResults ? (
          /* Input Form */
          <div className={styles.formSection}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>🚀 Quick Test Case Generation</h2>
                <p className={styles.formSubtitle}>
                  Generate 100-200+ EXHAUSTIVE test cases with ZERO limitations. Every possible scenario, edge case, attack vector, browser combination, data variation, and failure mode will be covered. Uses AI to create the most comprehensive test suite possible.
                </p>
                
                <div className={styles.coverageInfo}>
                  <h3 className={styles.coverageTitle}>🎯 COMPLETE Test Coverage - ALL Scenarios:</h3>
                  <div className={styles.coverageGrid}>
                    <div className={styles.coverageItem}>
                      <span className={styles.coverageIcon}>✅</span>
                      <strong>FUNCTIONAL TESTING</strong>
                      <span>Every happy path, alternative flow, validation rule, business logic, state transition, user interaction</span>
                    </div>
                    <div className={styles.coverageItem}>
                      <span className={styles.coverageIcon}>❌</span>
                      <strong>NEGATIVE TESTING</strong>
                      <span>All invalid inputs, missing data, authorization failures, server errors, network issues</span>
                    </div>
                    <div className={styles.coverageItem}>
                      <span className={styles.coverageIcon}>🔍</span>
                      <strong>BOUNDARY & EDGE CASES</strong>
                      <span>Every character limit, numerical boundary, special character, Unicode, large datasets</span>
                    </div>
                    <div className={styles.coverageItem}>
                      <span className={styles.coverageIcon}>🛡️</span>
                      <strong>SECURITY TESTING</strong>
                      <span>All injection attacks, authentication bypass, session vulnerabilities, encryption issues</span>
                    </div>
                    <div className={styles.coverageItem}>
                      <span className={styles.coverageIcon}>⚡</span>
                      <strong>PERFORMANCE & USABILITY</strong>
                      <span>Load testing, stress testing, all browsers, devices, accessibility compliance</span>
                    </div>
                    <div className={styles.coverageItem}>
                      <span className={styles.coverageIcon}>🔗</span>
                      <strong>INTEGRATION TESTING</strong>
                      <span>All API endpoints, database operations, third-party services, file operations</span>
                    </div>
                    <div className={styles.coverageItem}>
                      <span className={styles.coverageIcon}>🔍</span>
                      <strong>INTELLIGENT FAILURE DETECTION</strong>
                      <span>Predicts breakpoints, analyzes critical paths, tests recovery mechanisms, detects silent failures</span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={generateTestCases} className={styles.form}>
                {errors.general && (
                  <div className={styles.errorAlert}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {errors.general}
                  </div>
                )}

                <div className={styles.formGrid}>
                  {/* Website URL */}
                  <div className={styles.formGroup}>
                    <label htmlFor="websiteUrl" className={styles.label}>
                      Website URL <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="url"
                      id="websiteUrl"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.websiteUrl ? styles.inputError : ''}`}
                      placeholder="https://example.com"
                      disabled={isGenerating}
                    />
                    {errors.websiteUrl && (
                      <span className={styles.fieldError}>{errors.websiteUrl}</span>
                    )}
                  </div>

                  {/* Username */}
                  <div className={styles.formGroup}>
                    <label htmlFor="username" className={styles.label}>
                      Username <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                      placeholder="Enter test username"
                      disabled={isGenerating}
                    />
                    {errors.username && (
                      <span className={styles.fieldError}>{errors.username}</span>
                    )}
                  </div>

                  {/* Password */}
                  <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.label}>
                      Password <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                      placeholder="Enter test password"
                      disabled={isGenerating}
                    />
                    {errors.password && (
                      <span className={styles.fieldError}>{errors.password}</span>
                    )}
                  </div>
                </div>

                {/* Module Flow */}
                <div className={styles.formGroup}>
                  <label htmlFor="moduleFlow" className={styles.label}>
                    Module Flow Description <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="moduleFlow"
                    name="moduleFlow"
                    value={formData.moduleFlow}
                    onChange={handleInputChange}
                    className={`${styles.textarea} ${errors.moduleFlow ? styles.inputError : ''}`}
                    placeholder="Describe the complete module flow in detail. Include all steps, user interactions, expected outcomes, and data flow. Example: 'E-commerce checkout flow - User adds items to cart, proceeds to checkout, enters shipping address, selects payment method, enters card details, reviews order summary, confirms purchase, receives confirmation email and order number, redirects to order tracking page'"
                    rows={4}
                    disabled={isGenerating}
                  />
                  {errors.moduleFlow && (
                    <span className={styles.fieldError}>{errors.moduleFlow}</span>
                  )}
                  <span className={styles.inputHint}>
                    Be specific about the steps, expected outcomes, potential failure points, and dependencies. Mention where you think the system might break or what could go wrong.
                  </span>
                </div>

                {/* Additional Notes */}
                <div className={styles.formGroup}>
                  <label htmlFor="additionalNotes" className={styles.label}>
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="Specify edge cases, business rules, browser requirements, performance criteria, security concerns, accessibility needs, or integration points. Example: 'Test on mobile Safari, handle payment failures gracefully, support concurrent user sessions, validate GDPR compliance, ensure 2-second page load times'"
                    rows={3}
                    disabled={isGenerating}
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.generateButton}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <span className={styles.loadingSpinner}>🤖</span>
                        Generating ALL Test Cases...
                      </>
                    ) : (
                      <>
                        <span className={styles.buttonIcon}>🎯</span>
                        Generate 100-200+ Test Cases (NO LIMITS)
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Test Cases Results */
          <div ref={testCasesRef} className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <div className={styles.resultsInfo}>
                <h2 className={styles.resultsTitle}>🎯 Generated Test Cases</h2>
                <p className={styles.resultsSubtitle}>
                  {testCases.length} test cases generated for <strong>{formData.websiteUrl}</strong>
                </p>
              </div>
              
              <div className={styles.resultsActions}>
                <button
                  onClick={() => setShowResults(false)}
                  className={styles.backButton}
                >
                  ← Back to Form
                </button>
                <button
                  onClick={addNewTestCase}
                  className={styles.addButton}
                >
                  + Add Test Case
                </button>
                <button
                  onClick={exportToExcel}
                  className={styles.exportButton}
                  title="Export test cases to Excel"
                >
                  <span className={styles.buttonIcon}>📊</span>
                  Export to Excel
                </button>
                <button
                  onClick={executeTestCases}
                  className={styles.executeButton}
                  disabled={isExecuting}
                >
                  {isExecuting ? (
                    <>
                      <span className={styles.loadingSpinner}>⚙️</span>
                      Executing Tests...
                    </>
                  ) : (
                    <>
                      <span className={styles.buttonIcon}>🚀</span>
                      Execute Test Cases
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.testCasesTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableHeaderCell}>Test ID</div>
                <div className={styles.tableHeaderCell}>Test Description</div>
                <div className={styles.tableHeaderCell}>Test Endpoints</div>
                <div className={styles.tableHeaderCell}>Comments</div>
                <div className={styles.tableHeaderCell}>Actions</div>
              </div>

              {testCases.map((testCase, index) => (
                <div key={index} className={styles.tableRow}>
                  <div className={styles.tableCell}>
                    <input
                      type="text"
                      value={testCase.testId}
                      onChange={(e) => handleTestCaseEdit(index, 'testId', e.target.value)}
                      className={styles.tableCellInput}
                    />
                  </div>
                  
                  <div className={styles.tableCell}>
                    <textarea
                      value={testCase.testDescription}
                      onChange={(e) => handleTestCaseEdit(index, 'testDescription', e.target.value)}
                      className={styles.tableCellTextarea}
                      rows={3}
                    />
                  </div>
                  
                  <div className={styles.tableCell}>
                    <input
                      type="text"
                      value={testCase.testEndpoints}
                      onChange={(e) => handleTestCaseEdit(index, 'testEndpoints', e.target.value)}
                      className={styles.tableCellInput}
                    />
                  </div>
                  
                  <div className={styles.tableCell}>
                    <textarea
                      value={testCase.comments}
                      onChange={(e) => handleTestCaseEdit(index, 'comments', e.target.value)}
                      className={styles.tableCellTextarea}
                      rows={2}
                    />
                  </div>
                  
                  <div className={styles.tableCell}>
                    <button
                      onClick={() => removeTestCase(index)}
                      className={styles.deleteButton}
                      title="Delete test case"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {testCases.length === 0 && (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📝</span>
                  <p className={styles.emptyText}>No test cases generated yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
