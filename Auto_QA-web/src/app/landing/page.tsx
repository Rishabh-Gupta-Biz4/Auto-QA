/**
 * Landing Page Component - Public homepage for AUTO-QA
 * Following Next.js rules: Use app router structure, server/client components appropriately
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import styles from './landing.module.scss';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.125rem',
        color: '#64748b'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.landingContainer}>
      {/* Navigation Header */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.navBrand}>
            <div className={styles.brandIcon}>
              <span className={styles.brandSymbol}>⚡</span>
            </div>
            <h1 className={styles.brandText}>AUTO-QA</h1>
          </div>
          
          <div className={styles.navActions}>
            <Link href="/login" className={styles.loginBtn}>
              Sign In
            </Link>
            <Link href="/register" className={styles.registerBtn}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Automate Your <span className={styles.highlight}>QA Testing</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Streamline your quality assurance process with our powerful automation platform. 
              Run tests faster, catch bugs earlier, and ship with confidence.
            </p>
            
            <div className={styles.heroActions}>
              <Link href="/register" className={styles.primaryBtn}>
                Start Free Trial
              </Link>
              <Link href="/login" className={styles.secondaryBtn}>
                Sign In
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>10,000+</span>
                <span className={styles.statLabel}>Tests Automated</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Companies Trust Us</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>99.9%</span>
                <span className={styles.statLabel}>Uptime</span>
              </div>
            </div>
          </div>

          <div className={styles.heroImage}>
            <div className={styles.imageCard}>
              <div className={styles.mockDashboard}>
                <div className={styles.mockHeader}>
                  <div className={styles.mockLogo}>
                    <span>⚡</span>
                    <span>AUTO-QA</span>
                  </div>
                  <div className={styles.mockNav}>
                    <div className={styles.mockNavItem}></div>
                    <div className={styles.mockNavItem}></div>
                    <div className={styles.mockNavItem}></div>
                  </div>
                </div>
                <div className={styles.mockContent}>
                  <div className={styles.mockMetrics}>
                    <div className={styles.mockMetric}>
                      <div className={styles.mockMetricIcon}>📊</div>
                      <div className={styles.mockMetricData}>
                        <div className={styles.mockMetricNumber}>254</div>
                        <div className={styles.mockMetricLabel}>Test Cases</div>
                      </div>
                    </div>
                    <div className={styles.mockMetric}>
                      <div className={styles.mockMetricIcon}>✅</div>
                      <div className={styles.mockMetricData}>
                        <div className={styles.mockMetricNumber}>89%</div>
                        <div className={styles.mockMetricLabel}>Pass Rate</div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.mockChart}>
                    <div className={styles.mockChartBars}>
                      <div className={styles.mockBar} style={{ height: '60%' }}></div>
                      <div className={styles.mockBar} style={{ height: '80%' }}></div>
                      <div className={styles.mockBar} style={{ height: '45%' }}></div>
                      <div className={styles.mockBar} style={{ height: '90%' }}></div>
                      <div className={styles.mockBar} style={{ height: '70%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Powerful QA Automation Features</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to streamline your testing workflow
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🚀</div>
              <h3 className={styles.featureTitle}>Quick Launch</h3>
              <p className={styles.featureDescription}>
                Start testing in minutes with our intuitive setup process and pre-built templates.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌐</div>
              <h3 className={styles.featureTitle}>Web Testing</h3>
              <p className={styles.featureDescription}>
                Comprehensive web application testing across multiple browsers and devices.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h3 className={styles.featureTitle}>Mobile Testing</h3>
              <p className={styles.featureDescription}>
                Native and hybrid mobile app testing for iOS and Android platforms.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>Analytics</h3>
              <p className={styles.featureDescription}>
                Detailed reports and insights to track your testing performance and trends.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔗</div>
              <h3 className={styles.featureTitle}>CI/CD Integration</h3>
              <p className={styles.featureDescription}>
                Seamless integration with your existing development and deployment pipeline.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🛡️</div>
              <h3 className={styles.featureTitle}>Security Testing</h3>
              <p className={styles.featureDescription}>
                Built-in security testing capabilities to protect your applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Automate Your Testing?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of teams who trust AUTO-QA for their quality assurance needs.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/register" className={styles.ctaPrimary}>
              Start Free Trial
            </Link>
            <Link href="/login" className={styles.ctaSecondary}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span className={styles.footerSymbol}>⚡</span>
              <span className={styles.footerText}>AUTO-QA</span>
            </div>
            <p className={styles.footerDescription}>
              The most powerful QA automation platform for modern development teams.
            </p>
          </div>
          
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h3 className={styles.footerColumnTitle}>Product</h3>
              <a href="#" className={styles.footerLink}>Features</a>
              <a href="#" className={styles.footerLink}>Pricing</a>
              <a href="#" className={styles.footerLink}>Documentation</a>
            </div>
            
            <div className={styles.footerColumn}>
              <h3 className={styles.footerColumnTitle}>Company</h3>
              <a href="#" className={styles.footerLink}>About</a>
              <a href="#" className={styles.footerLink}>Careers</a>
              <a href="#" className={styles.footerLink}>Contact</a>
            </div>
            
            <div className={styles.footerColumn}>
              <h3 className={styles.footerColumnTitle}>Support</h3>
              <a href="#" className={styles.footerLink}>Help Center</a>
              <a href="#" className={styles.footerLink}>Community</a>
              <a href="#" className={styles.footerLink}>Status</a>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © 2024 AUTO-QA Platform. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.backgroundGrid}></div>
        <div className={styles.backgroundGradient}></div>
      </div>
    </div>
  );
}
