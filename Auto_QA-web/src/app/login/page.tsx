'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useLoginForm } from '@/hooks/useAuthForms';
import GoogleLoginButton from '@/components/google-login-button';
import styles from './login.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    onSubmit
  } = useLoginForm();

  // Redirect to dashboard if already authenticated
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
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <span className={styles.logoSymbol}>⚡</span>
          </div>
          <h1 className={styles.logoText}>AUTO-QA</h1>
          <p className={styles.logoSubtext}>Auto QA Testing Platform</p>
        </div>

        {/* Login Form */}
        <form onSubmit={onSubmit} className={styles.loginForm}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>Sign in to your account to continue</p>
          </div>

          {errors.root && (
            <div className={styles.errorAlert}>
              <span className={styles.errorIcon}>⚠️</span>
              {errors.root.message}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email address
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className={styles.fieldError}>{errors.email.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register('password')}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className={styles.fieldError}>{errors.password.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                {...register('rememberMe')}
                className={styles.checkbox}
                disabled={isSubmitting}
              />
              <span className={styles.checkboxText}>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className={styles.loadingSpinner}>⏳</span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerText}>or</span>
        </div>

        {/* Google Login */}
        <div className={styles.socialLogin}>
          <GoogleLoginButton disabled={isSubmitting} />
        </div>

        {/* Sign Up Link */}
        <div className={styles.signupSection}>
          <p className={styles.signupText}>
            Don't have an account?{' '}
            <Link href="/register" className={styles.signupLink}>
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.backgroundCircle1}></div>
        <div className={styles.backgroundCircle2}></div>
        <div className={styles.backgroundGrid}></div>
      </div>
    </div>
  );
}