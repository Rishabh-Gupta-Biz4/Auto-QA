/**
 * Reusable Header Component
 * Following Next.js rules: Use strict typing, kebab-case filename, PascalCase component name
 */

import { ReactNode } from "react";
import styles from "./header.module.scss";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    plan?: string;
  };
  showUserProfile?: boolean;
  showNotifications?: boolean;
}

export default function Header({
  title = "Dashboard",
  subtitle = "Check your key performance indicators",
  children,
  className = "",
  user = {
    name: "John Newman",
    email: "john@example.com",
    plan: "Free"
  },
  showUserProfile = true,
  showNotifications = true
}: HeaderProps) {
  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <div className={styles.rightSection}>
          {children}
          
          {showNotifications && (
            <button className={styles.notificationBtn}>
              <span className={styles.notificationIcon}>🔔</span>
              <span className={styles.notificationBadge}>3</span>
            </button>
          )}

          {showUserProfile && (
            <div className={styles.userProfile}>
              <div className={styles.userInfo}>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userPlan}>{user.plan}</span>
                </div>
                <div className={styles.userAvatar}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className={styles.avatarImage} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.userActions}>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>👤</span>
                  <span>UI Control</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time filter tabs */}
      <div className={styles.timeFilters}>
        <button className={styles.timeFilter}>Last week</button>
        <button className={`${styles.timeFilter} ${styles.active}`}>Last day</button>
        <button className={styles.timeFilter}>Last month</button>
        <button className={styles.timeFilter}>Last year</button>
      </div>
    </header>
  );
}
