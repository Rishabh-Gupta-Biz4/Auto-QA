/**
 * Chart Card Component
 * Following Next.js rules: Use strict typing, kebab-case filename, PascalCase component name
 */

'use client';

import { ReactNode } from "react";
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import styles from "./chart-card.module.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartCardProps {
  title: string;
  type: 'doughnut' | 'line';
  data: ChartData<'doughnut'> | ChartData<'line'>;
  options?: ChartOptions<'doughnut'> | ChartOptions<'line'>;
  className?: string;
  loading?: boolean;
  actions?: ReactNode;
}

export default function ChartCard({
  title,
  type,
  data,
  options = {},
  className = "",
  loading = false,
  actions
}: ChartCardProps) {
  const defaultDoughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#374151',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    cutout: '70%',
  };

  const defaultLineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#374151',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
      line: {
        tension: 0.4,
      }
    }
  };

  const mergedOptions = (type === 'doughnut'
    ? { ...defaultDoughnutOptions, ...(options as ChartOptions<'doughnut'> | undefined) }
    : { ...defaultLineOptions, ...(options as ChartOptions<'line'> | undefined) }
  );

  if (loading) {
    return (
      <div className={`${styles.chartCard} ${styles.loading} ${className}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.chartContainer}>
          <div className={styles.loadingSkeleton}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.chartCard} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      
      <div className={styles.chartContainer}>
        {type === 'doughnut' ? (
          <Doughnut data={data} options={mergedOptions} />
        ) : (
          <Line data={data} options={mergedOptions} />
        )}
      </div>
    </div>
  );
}
