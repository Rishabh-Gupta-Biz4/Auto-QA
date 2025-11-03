/**
 * Dashboard Layout Component
 * Following Next.js rules: Use kebab-case for filenames, PascalCase for component names
 */

'use client';

import { ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import Header from "./header";
import styles from "./dashboard-layout.module.scss";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  showSidebar?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    plan?: string;
  };
}

export default function DashboardLayout({ 
  children, 
  title = "Dashboard",
  subtitle = "Check your key performance indicators",
  className = "",
  showSidebar = true,
  user
}: DashboardLayoutProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/landing';
  };
  return (
    <div className={`${styles.layout} ${className}`}>
      {showSidebar && (
        <nav className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <span className={styles.logoSymbol}>⚡</span>
              </div>
                      <h2 className={styles.logoText}>AUTO-QA</h2>
            </div>
            
            <div className={styles.userGreeting}>
              <h3 className={styles.greeting}>Hello John!</h3>
              <p className={styles.greetingSubtext}>Manage your Profile</p>
            </div>
            
            <ul className={styles.navigation}>
              <li className={styles.navItem}>
                <Link href="/dashboard" className={`${styles.navLink} ${styles.active}`}>
                  <span className={styles.navIcon}>📊</span>
                  Dashboard
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href="/dashboard/quick-launch" className={styles.navLink}>
                  <span className={styles.navIcon}>🚀</span>
                  Quick Launch
                </Link>
              </li>
            </ul>

            <div className={styles.upgradeSection}>
              <div className={styles.upgradeCard}>
                <p className={styles.upgradeText}>Upgrade to Premium for more resources!</p>
                <button className={styles.upgradeBtn}>Upgrade</button>
              </div>
              
              <div className={styles.logoutSection}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  <span className={styles.logoutIcon}>🚪</span>
                  Log out
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <div className={styles.mainContent}>
        <Header 
          title={title}
          subtitle={subtitle}
          user={user}
        />
        
        <main className={styles.main}>
          <div className={styles.content}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
