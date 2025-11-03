import { Router } from 'express';
import { DashboardController } from './controller';
import { dashboardQuerySchema, exportDashboardSchema } from './validation';
import { authenticate, authorize } from '@/middleware/auth';
import { validateQuery, validate } from '@/schema/validation';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics and metrics endpoints
 */

// Apply authentication to all dashboard routes
router.use(authenticate);

// Get complete dashboard data
router.get(
    '/',
    validateQuery(dashboardQuerySchema),
    dashboardController.getDashboard
);

// Get dashboard overview statistics
router.get(
    '/overview',
    validateQuery(dashboardQuerySchema),
    dashboardController.getOverview
);

// Get test execution metrics
router.get(
    '/test-metrics',
    validateQuery(dashboardQuerySchema),
    dashboardController.getTestMetrics
);

// Get bug analytics and trends
router.get(
    '/bug-analytics',
    validateQuery(dashboardQuerySchema),
    dashboardController.getBugAnalytics
);

// Get recent activity
router.get(
    '/recent-activity',
    validateQuery(dashboardQuerySchema),
    dashboardController.getRecentActivity
);

// Get project health metrics
router.get(
    '/project-health',
    validateQuery(dashboardQuerySchema),
    dashboardController.getProjectHealth
);

// Export dashboard data
router.post(
    '/export',
    validate(exportDashboardSchema),
    authorize('admin', 'qa_lead'),
    dashboardController.exportDashboard
);

export { router as dashboardRoutes };
