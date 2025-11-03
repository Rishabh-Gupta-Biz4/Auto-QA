'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/auth-context";
import styles from './loading.module.scss';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Authenticated users go to dashboard
        router.push('/dashboard');
      } else {
        // Non-authenticated users go to landing page
        router.push('/landing');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while determining redirect
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingText}>
        Loading
      </div>
    </div>
  );
}
