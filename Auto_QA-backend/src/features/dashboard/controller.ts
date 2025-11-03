import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseHandler } from '@/utils/response';
import { DashboardService } from './service';
import { DashboardQuery } from './interface';
import { validate, validateQuery } from '@/schema/validation';
import { MESSAGES, HTTP_STATUS } from '@/constants/messages';
import { logger } from '@/utils/logger';
import { 
    dashboardQuerySchema, 
    exportDashboardSchema 
} from './validation';

export class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
        this.dashboardService = new DashboardService();
    }

    /**
     * @swagger
     * /api/v1/dashboard:
     *   get:
     *     summary: Get complete dashboard data
     *     tags: [Dashboard]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: timeframe
     *         schema:
     *           type: string
     *           enum: [today, week, month, quarter, year, custom]
     *         description: Predefined time range
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *         description: Start date for custom range (YYYY-MM-DD)
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *         description: End date for custom range (YYYY-MM-DD)
     *       - in: query
     *         name: projectId
     *         schema:
     *           type: integer
     *         description: Filter by specific project
     *       - in: query
     *         name: includeInactive
     *         schema:
     *           type: boolean
     *         description: Include inactive projects
     *     responses:
     *       200:
     *         description: Dashboard data retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     overview:
     *                       type: object
     *                     testMetrics:
     *                       type: object
     *                     bugAnalytics:
     *                       type: object
     *                     recentActivity:
     *                       type: object
     *                     projectHealth:
     *                       type: array
     *       400:
     *         description: Invalid query parameters
     *       401:
     *         description: Unauthorized
     */
    public getDashboard = asyncHandler(async (req: Request, res: Response) => {
        try {
            logger.info("Dashboard data request received", { query: req.query });
            const query: DashboardQuery = req.query as any;
            const dashboardData = await this.dashboardService.getDashboardData(query);
            
            return ResponseHandler.success(
                res,
                MESSAGES.DASHBOARD.FETCH_SUCCESS,
                dashboardData
            );
        } catch (error) {
            logger.error("Dashboard controller error", { error, query: req.query });
            throw error;
        }
    });

    /**
     * @swagger
     * /api/v1/dashboard/overview:
     *   get:
     *     summary: Get dashboard overview statistics
     *     tags: [Dashboard]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: timeframe
     *         schema:
     *           type: string
     *           enum: [today, week, month, quarter, year, custom]
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: projectId
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Overview statistics retrieved successfully
     */
    public getOverview = asyncHandler(async (req: Request, res: Response) => {
        const query: DashboardQuery = req.query as any;
        const { startDate, endDate } = this.getDateRange(query.timeframe, query.startDate, query.endDate);
        
        const overview = await this.dashboardService.getOverview(startDate, endDate, query.projectId);
        
        return ResponseHandler.success(
            res,
            'Overview statistics retrieved successfully',
            overview
        );
    });

    /**
     * @swagger
     * /api/v1/dashboard/test-metrics:
     *   get:
     *     summary: Get test execution metrics
     *     tags: [Dashboard]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: timeframe
     *         schema:
     *           type: string
     *           enum: [today, week, month, quarter, year, custom]
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: projectId
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Test metrics retrieved successfully
     */
    public getTestMetrics = asyncHandler(async (req: Request, res: Response) => {
        const query: DashboardQuery = req.query as any;
        const { startDate, endDate } = this.getDateRange(query.timeframe, query.startDate, query.endDate);
        
        const testMetrics = await this.dashboardService.getTestMetrics(startDate, endDate, query.projectId);
        
        return ResponseHandler.success(
            res,
            'Test metrics retrieved successfully',
            testMetrics
        );
    });

    /**
     * @swagger
     * /api/v1/dashboard/bug-analytics:
     *   get:
     *     summary: Get bug analytics and trends
     *     tags: [Dashboard]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: timeframe
     *         schema:
     *           type: string
     *           enum: [today, week, month, quarter, year, custom]
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: projectId
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Bug analytics retrieved successfully
     */
    public getBugAnalytics = asyncHandler(async (req: Request, res: Response) => {
        const query: DashboardQuery = req.query as any;
        const { startDate, endDate } = this.getDateRange(query.timeframe, query.startDate, query.endDate);
        
        const bugAnalytics = await this.dashboardService.getBugAnalytics(startDate, endDate, query.projectId);
        
        return ResponseHandler.success(
            res,
            'Bug analytics retrieved successfully',
            bugAnalytics
        );
    });

    /**
     * @swagger
     * /api/v1/dashboard/recent-activity:
     *   get:
     *     summary: Get recent activity (executions, bugs, projects)
     *     tags: [Dashboard]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: projectId
     *         schema:
     *           type: integer
     *         description: Filter by specific project
     *     responses:
     *       200:
     *         description: Recent activity retrieved successfully
     */
    public getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
        const query: DashboardQuery = req.query as any;
        const recentActivity = await this.dashboardService.getRecentActivity(query.projectId);
        
        return ResponseHandler.success(
            res,
            'Recent activity retrieved successfully',
            recentActivity
        );
    });

    /**
     * @swagger
     * /api/v1/dashboard/project-health:
     *   get:
     *     summary: Get project health metrics
     *     tags: [Dashboard]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: timeframe
     *         schema:
     *           type: string
     *           enum: [today, week, month, quarter, year, custom]
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *     responses:
     *       200:
     *         description: Project health metrics retrieved successfully
     */
    public getProjectHealth = asyncHandler(async (req: Request, res: Response) => {
        const query: DashboardQuery = req.query as any;
        const { startDate, endDate } = this.getDateRange(query.timeframe, query.startDate, query.endDate);
        
        const projectHealth = await this.dashboardService.getProjectHealth(startDate, endDate);
        
        return ResponseHandler.success(
            res,
            'Project health metrics retrieved successfully',
            projectHealth
        );
    });

    /**
     * @swagger
     * /api/v1/dashboard/export:
     *   post:
     *     summary: Export dashboard data to CSV/PDF
     *     tags: [Dashboard]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               format:
     *                 type: string
     *                 enum: [csv, pdf]
     *                 example: csv
     *               timeframe:
     *                 type: string
     *                 enum: [today, week, month, quarter, year, custom]
     *               startDate:
     *                 type: string
     *                 format: date
     *               endDate:
     *                 type: string
     *                 format: date
     *               projectId:
     *                 type: integer
     *               sections:
     *                 type: array
     *                 items:
     *                   type: string
     *                   enum: [overview, testMetrics, bugAnalytics, recentActivity, projectHealth]
     *                 example: [overview, testMetrics, bugAnalytics]
     *     responses:
     *       200:
     *         description: Export file generated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     downloadUrl:
     *                       type: string
     *                     fileName:
     *                       type: string
     *                     fileSize:
     *                       type: number
     */
    public exportDashboard = asyncHandler(async (req: Request, res: Response) => {
        const { format, timeframe, startDate, endDate, projectId, sections } = req.body;
        
        // TODO: Implement export functionality
        // This would generate CSV/PDF files with dashboard data
        
        return ResponseHandler.success(
            res,
            'Dashboard export initiated successfully',
            {
                downloadUrl: '/api/v1/dashboard/download/dashboard-export.csv',
                fileName: `dashboard-export-${new Date().toISOString().split('T')[0]}.${format}`,
                fileSize: 1024 // Placeholder
            }
        );
    });

    /**
     * Helper method to get date range
     */
    private getDateRange(timeframe?: string, startDate?: string, endDate?: string): { startDate: Date; endDate: Date } {
        const end = endDate ? new Date(endDate) : new Date();
        let start: Date;

        switch (timeframe) {
            case 'today':
                start = new Date();
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start = new Date();
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start = new Date();
                start.setMonth(start.getMonth() - 1);
                break;
            case 'quarter':
                start = new Date();
                start.setMonth(start.getMonth() - 3);
                break;
            case 'year':
                start = new Date();
                start.setFullYear(start.getFullYear() - 1);
                break;
            default:
                start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
        }

        return { startDate: start, endDate: end };
    }
}

// Validation schemas are now imported from ./validation
