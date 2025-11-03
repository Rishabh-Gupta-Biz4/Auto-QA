import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import passport from 'passport';
import './utils/env-loader'; // Load environment configuration

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { securityGuard } from './middleware/sql-injection-guard';
import { logger } from './utils/logger';
import { swaggerOptions } from './swagger/config';
import { connectDB, getDB } from './db/connection';
import { dashboardRoutes } from './features/dashboard/routes';
import { createAuthRoutes } from './features/auth/auth.routes';
import { createGoogleAuthRoutes } from './features/auth/google-auth.routes';
import { configureGoogleStrategy } from './features/auth/google-strategy';
import { createTestCasesRoutes } from './features/test-cases/test-cases.routes';
import { validateGoogleOAuthConfig } from './config/google-oauth';

// Environment variables are loaded by env-loader import

class App {
    public app: Application;
    private readonly port: number;

    constructor() {
        this.app = express();
        this.port = parseInt(process.env.PORT || '3000', 10);
        
        this.initializeMiddlewares();
        this.initializeApp();
    }

    private async initializeApp(): Promise<void> {
        try {
            await this.initializeDatabase();
            this.initializeRoutes();
            this.initializeSwagger();
            this.initializeErrorHandling();
        } catch (error) {
            logger.error('App initialization failed:', error);
            process.exit(1);
        }
    }

    private async initializeDatabase(): Promise<void> {
        try {
            await connectDB();
            logger.info('Database connected successfully');
            
            // Initialize Passport Google Strategy after database connection
            const db = getDB();
            configureGoogleStrategy(db);
            logger.info('Google OAuth strategy configured');
            
            // Validate Google OAuth configuration
            const isGoogleConfigured = validateGoogleOAuthConfig();
            if (isGoogleConfigured) {
                logger.info('Google OAuth is properly configured');
            } else {
                logger.warn('Google OAuth is not configured. Social login will not be available.');
            }
        } catch (error) {
            logger.error('Database connection failed:', error);
            throw error;
        }
    }

    private initializeMiddlewares(): void {
        // Security middleware
        this.app.use(helmet());
        
        // CORS configuration
        this.app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        }));

        // Compression middleware
        this.app.use(compression());

        // Rate limiting
        this.app.use(rateLimiter);

        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Initialize Passport
        this.app.use(passport.initialize());

        // SQL Injection & XSS Protection
        // Applied to all routes except health check and API docs
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            if (req.path.startsWith('/health') || req.path.startsWith('/api-docs')) {
                return next();
            }
            securityGuard({
                strictMode: true,
                checkQuery: true,
                checkBody: true,
                checkParams: true,
                skipFields: ['password', 'token', 'refreshToken', 'accessToken'],
                logAttempts: true
            })(req, res, next);
        });

        // Request logging
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            logger.info(`${req.method} ${req.path} - ${req.ip}`);
            next();
        });
    }

    private initializeRoutes(): void {
        // Health check endpoint
        this.app.get('/health', (req: Request, res: Response) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        // API routes
        const db = getDB();
        this.app.use('/api/v1/auth', createAuthRoutes(db));
        this.app.use('/api/v1/auth', createGoogleAuthRoutes(db)); // Google OAuth routes
        this.app.use('/api/v1/dashboard', dashboardRoutes);
        this.app.use('/api/v1/test-cases', createTestCasesRoutes(db));
        // this.app.use('/api/v1/projects', projectRoutes);
        // this.app.use('/api/v1/test-cases', testCaseRoutes);

        // 404 handler
        this.app.use('*', (req: Request, res: Response) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.originalUrl} not found`,
            });
        });
    }

    private initializeSwagger(): void {
        const specs = swaggerJSDoc(swaggerOptions);
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    }

    private initializeErrorHandling(): void {
        this.app.use(errorHandler);
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            logger.info(`Server is running on port ${this.port}`);
            logger.info(`API Documentation available at http://localhost:${this.port}/api-docs`);
        });
    }
}

// Start the server
const server = new App();
server.listen();

export default App;