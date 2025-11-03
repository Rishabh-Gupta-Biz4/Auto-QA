'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/slices/authSlice';
import styles from './callback.module.scss';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL parameters
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const userParam = searchParams.get('user');
        const errorParam = searchParams.get('error');

        // Check for errors
        if (errorParam) {
          setError(getErrorMessage(errorParam));
          setIsProcessing(false);
          return;
        }

        // Validate required parameters
        if (!token || !refreshToken || !userParam) {
          setError('Invalid authentication response. Please try again.');
          setIsProcessing(false);
          return;
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userParam));

        // Dispatch login action to Redux
        dispatch(login({
          user: {
            name: user.name,
            email: user.email,
            plan: user.role === 'admin' ? 'Premium' : 'Free'
          },
          token,
          refreshToken
        }));

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);

      } catch (error) {
        console.error('Google callback error:', error);
        setError('Failed to process Google login. Please try again.');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, dispatch, router]);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth_failed':
        return 'Google authentication failed. Please try again.';
      case 'no_user':
        return 'No user information received from Google.';
      case 'server_error':
        return 'Server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  if (error) {
    return (
      <div className={styles.callbackContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>❌</div>
          <h2 className={styles.errorTitle}>Authentication Failed</h2>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.actions}>
            <a href="/login" className={styles.backButton}>
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.callbackContainer}>
      <div className={styles.loadingCard}>
        <div className={styles.spinner}></div>
        <h2 className={styles.loadingTitle}>
          {isProcessing ? 'Completing Google Sign-In...' : 'Redirecting to Dashboard...'}
        </h2>
        <p className={styles.loadingText}>Please wait while we set up your account</p>
      </div>
    </div>
  );
}


