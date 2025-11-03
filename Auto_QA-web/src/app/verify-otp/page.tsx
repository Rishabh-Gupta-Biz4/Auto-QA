'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearPendingRegistration } from '@/redux/slices/registrationSlice';
import styles from './verify-otp.module.scss';

interface OTPVerificationData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Redux
  const dispatch = useAppDispatch();
  const pendingRegistration = useAppSelector((state) => state.registration.pendingRegistration);
  
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [registrationData, setRegistrationData] = useState<OTPVerificationData | null>(null);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Get registration data from URL params or Redux store
  useEffect(() => {
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    const role = searchParams.get('role');

    if (name && email && password && role) {
      setRegistrationData({ name, email, password, role });
    } else if (pendingRegistration) {
      // Get from Redux store as fallback
      setRegistrationData(pendingRegistration);
    } else {
      // No registration data found, redirect to register
      router.push('/register');
    }
  }, [searchParams, pendingRegistration, router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleVerifyOTP = async () => {
    if (!registrationData) {
      setError('Registration data not found. Please try registering again.');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/verify-otp-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registrationData.name,
          email: registrationData.email,
          password: registrationData.password,
          role: registrationData.role,
          otp: otp
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Clear pending registration data from Redux
        dispatch(clearPendingRegistration());
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!registrationData) return;

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registrationData.email
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTimeLeft(600); // Reset timer
        setError('');
        alert('OTP sent successfully! Check the server console for the code.');
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

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

  if (!registrationData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.125rem',
        color: '#64748b'
      }}>
        Redirecting to registration...
      </div>
    );
  }

  return (
    <div className={styles.verifyContainer}>
      <div className={styles.verifyCard}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <span className={styles.logoSymbol}>🔐</span>
          </div>
          <h1 className={styles.logoText}>Verify OTP</h1>
          <p className={styles.logoSubtext}>Enter the OTP sent to your email</p>
        </div>

        {!success ? (
          <>
            {/* OTP Verification Form */}
            <div className={styles.verifyForm}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Email Verification</h2>
                <p className={styles.formSubtitle}>
                  We've sent a 6-digit code to <strong>{registrationData.email}</strong>
                </p>
              </div>

              {error && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}>⚠️</span>
                  {error}
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="otp" className={styles.label}>
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={handleOTPChange}
                  className={`${styles.otpInput} ${error ? styles.inputError : ''}`}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isVerifying}
                />
                <p className={styles.otpHint}>
                  Check the server console for the OTP code
                </p>
              </div>

              {/* Timer */}
              <div className={styles.timerSection}>
                {timeLeft > 0 ? (
                  <p className={styles.timerText}>
                    Code expires in <span className={styles.timerValue}>{formatTime(timeLeft)}</span>
                  </p>
                ) : (
                  <p className={styles.timerExpired}>Code has expired</p>
                )}
              </div>

              <button
                onClick={handleVerifyOTP}
                className={styles.verifyButton}
                disabled={isVerifying || otp.length !== 6 || timeLeft === 0}
              >
                {isVerifying ? (
                  <span className={styles.loadingSpinner}>⏳</span>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className={styles.resendSection}>
                <p className={styles.resendText}>
                  Didn't receive the code?{' '}
                  <button
                    onClick={handleResendOTP}
                    className={styles.resendButton}
                    disabled={isVerifying}
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
            </div>

            {/* Back to Register */}
            <div className={styles.backSection}>
              <p className={styles.backText}>
                Wrong email?{' '}
                <a href="/register" className={styles.backLink}>
                  Go back to registration
                </a>
              </p>
            </div>
          </>
        ) : (
          /* Success Message */
          <div className={styles.successSection}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>Verification Successful!</h2>
            <p className={styles.successMessage}>
              Your account has been created successfully. 
              You will be redirected to the login page shortly.
            </p>
            <div className={styles.successActions}>
              <a href="/login" className={styles.loginButton}>
                Go to Login
              </a>
            </div>
          </div>
        )}
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
