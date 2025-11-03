import Joi from 'joi';

/**
 * Dashboard validation schemas
 * Following Node.js rules: Centralized validation layers
 */

/**
 * Dashboard query parameters validation schema
 */
export const dashboardQuerySchema = Joi.object({
    timeframe: Joi.string()
        .valid('today', 'week', 'month', 'quarter', 'year', 'custom')
        .optional()
        .description('Predefined time range for dashboard data'),
    
    startDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .description('Start date for custom range (YYYY-MM-DD)'),
    
    endDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .description('End date for custom range (YYYY-MM-DD)'),
    
    projectId: Joi.number()
        .integer()
        .positive()
        .optional()
        .description('Filter by specific project ID'),
    
    includeInactive: Joi.boolean()
        .optional()
        .default(false)
        .description('Include inactive projects in results')
}).custom((value, helpers) => {
    // Custom validation: if timeframe is 'custom', startDate and endDate are required
    if (value.timeframe === 'custom') {
        if (!value.startDate || !value.endDate) {
            return helpers.error('any.custom', {
                message: 'startDate and endDate are required when timeframe is "custom"'
            });
        }
        
        // Validate date range
        const start = new Date(value.startDate);
        const end = new Date(value.endDate);
        
        if (start >= end) {
            return helpers.error('any.custom', {
                message: 'startDate must be before endDate'
            });
        }
        
        // Limit range to maximum 1 year
        const oneYearMs = 365 * 24 * 60 * 60 * 1000;
        if (end.getTime() - start.getTime() > oneYearMs) {
            return helpers.error('any.custom', {
                message: 'Date range cannot exceed 1 year'
            });
        }
    }
    
    return value;
});

/**
 * Dashboard export request validation schema
 */
export const exportDashboardSchema = Joi.object({
    format: Joi.string()
        .valid('csv', 'pdf')
        .required()
        .description('Export format'),
    
    timeframe: Joi.string()
        .valid('today', 'week', 'month', 'quarter', 'year', 'custom')
        .optional()
        .description('Time range for export'),
    
    startDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .description('Start date for custom range'),
    
    endDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .description('End date for custom range'),
    
    projectId: Joi.number()
        .integer()
        .positive()
        .optional()
        .description('Filter by specific project'),
    
    sections: Joi.array()
        .items(
            Joi.string().valid(
                'overview', 
                'testMetrics', 
                'bugAnalytics', 
                'recentActivity', 
                'projectHealth'
            )
        )
        .min(1)
        .unique()
        .optional()
        .default(['overview', 'testMetrics', 'bugAnalytics'])
        .description('Dashboard sections to include in export'),
    
    includeCharts: Joi.boolean()
        .optional()
        .default(true)
        .description('Include charts and visualizations in export'),
    
    fileName: Joi.string()
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .max(50)
        .optional()
        .description('Custom filename for export (without extension)')
});

/**
 * Project filter validation schema
 */
export const projectFilterSchema = Joi.object({
    projectId: Joi.number()
        .integer()
        .positive()
        .required()
        .description('Project ID to filter by')
});

/**
 * Date range validation schema (reusable)
 */
export const dateRangeSchema = Joi.object({
    startDate: Joi.date()
        .iso()
        .required()
        .description('Start date in ISO format'),
    
    endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .required()
        .description('End date in ISO format (must be after startDate)')
});

/**
 * Pagination validation schema for dashboard lists
 */
export const dashboardPaginationSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .description('Page number'),
    
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .description('Items per page'),
    
    sortBy: Joi.string()
        .valid('date', 'name', 'status', 'priority', 'severity')
        .optional()
        .default('date')
        .description('Sort field'),
    
    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .optional()
        .default('desc')
        .description('Sort order')
});
