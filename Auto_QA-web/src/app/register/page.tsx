'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useRegisterForm } from '@/hooks/useAuthForms';
import styles from './register.module.scss';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const form = useRegisterForm();
  const { register, formState, onSubmit, isSubmitting } = form;
  const { errors } = formState || { errors: undefined };

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.125rem',
          color: '#64748b',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <span className={styles.logoSymbol}>âš¡</span>
          </div>
          <h1 className={styles.logoText}>AUTO-QA</h1>
          <p className={styles.logoSubtext}>Auto QA Testing Platform</p>
        </div>

        {/* Registration Form */}
        <form 
          onSubmit={(e) => {
            if (isSubmitting) {
              e.preventDefault();
              return;
            }
            onSubmit(e);
          }} 
          className={styles.registerForm}
        >
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Create your account</h2>
            <p className={styles.formSubtitle}>Join us to start automated testing</p>
          </div>

          {errors?.root && (
            <div className={styles.errorAlert}>
              <span className={styles.errorIcon}>âš ï¸</span>
              {errors.root.message}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className={`${styles.input} ${errors?.name ? styles.inputError : ''}`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {errors?.name && <span className={styles.fieldError}>{errors.name.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email address
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`${styles.input} ${errors?.email ? styles.inputError : ''}`}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {errors?.email && <span className={styles.fieldError}>{errors.email.message}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register('password')}
                className={`${styles.input} ${errors?.password ? styles.inputError : ''}`}
                placeholder="Create a password"
                disabled={isSubmitting}
              />
              {errors?.password && (
                <span className={styles.fieldError}>{errors.password.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword')}
                className={`${styles.input} ${errors?.confirmPassword ? styles.inputError : ''}`}
                placeholder="Confirm your password"
                disabled={isSubmitting}
              />
              {errors?.confirmPassword && (
                <span className={styles.fieldError}>{errors.confirmPassword.message}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>
              Role
            </label>
            <select
              id="role"
              {...register('role')}
              className={styles.select}
              disabled={isSubmitting}
            >
              <option value="qa_engineer">QA Engineer</option>
              <option value="qa_lead">QA Lead</option>
              <option value="developer">Developer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                {...register('agreeToTerms')}
                className={styles.checkbox}
                disabled={isSubmitting}
              />
              <span className={styles.checkboxText}>
                I agree to the{' '}
                <a href="#" className={styles.link}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className={styles.link}>
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors?.agreeToTerms && (
              <span className={styles.fieldError}>{errors.agreeToTerms.message}</span>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={isSubmitting}
            onClick={(e) => {
              if (isSubmitting) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {isSubmitting ? <span className={styles.loadingSpinner}>â³</span> : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className={styles.loginSection}>
          <p className={styles.loginText}>
            Already have an account?{' '}
            <a href="/login" className={styles.loginLink}>
              Sign in here
            </a>
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
