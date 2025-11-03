/**
 * Loading Component
 * Following Next.js rules: Use strict typing, kebab-case filename, PascalCase component name
 */

import { LoadingProps } from "@/types/dashboard";
import styles from "./loading.module.scss";

export default function Loading({ 
  size = "medium", 
  className = "" 
}: LoadingProps) {
  return (
    <div className={`${styles.loading} ${styles[size]} ${className}`}>
      <div className={styles.spinner}>
        <div className={styles.spinnerInner}></div>
      </div>
    </div>
  );
}
