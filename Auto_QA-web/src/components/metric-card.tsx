/**
 * Metric Card Component
 * Following Next.js rules: Use strict typing with interface, kebab-case filename, PascalCase component name
 */

import { ReactNode } from "react";
import styles from "./metric-card.module.scss";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  className?: string;
  loading?: boolean;
}

export default function MetricCard({
  title,
  value,
  icon,
  trend,
  className = "",
  loading = false
}: MetricCardProps) {
  if (loading) {
    return (
      <div className={`${styles.card} ${styles.loading} ${className}`}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSkeleton}></div>
          <div className={styles.loadingSkeleton}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <h3 className={styles.title}>{title}</h3>
        </div>
        {trend && (
          <div className={`${styles.trend} ${styles[trend.direction]}`}>
            <span className={styles.trendIcon}>
              {trend.direction === "up" ? "↗" : "↘"}
            </span>
            <span className={styles.trendValue}>
              {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>
      
      <div className={styles.valueSection}>
        <span className={styles.value}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
      </div>
    </div>
  );
}
