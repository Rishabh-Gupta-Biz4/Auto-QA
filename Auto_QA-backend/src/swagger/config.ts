import { Options } from 'swagger-jsdoc';

export const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auto QA Backend API',
            version: '1.0.0',
            description: 'API documentation for Auto QA Backend',
            contact: {
                name: 'Auto QA Team',
                email: 'support@autoqa.com',
            },
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: process.env.PRODUCTION_API_URL || 'https://api.autoqa.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'string',
                            example: 'Error message',
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                            example: 'Operation successful',
                        },
                        data: {
                            type: 'object',
                        },
                    },
                },
                PaginatedResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                            },
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: {
                                    type: 'number',
                                    example: 1,
                                },
                                limit: {
                                    type: 'number',
                                    example: 10,
                                },
                                total: {
                                    type: 'number',
                                    example: 100,
                                },
                                pages: {
                                    type: 'number',
                                    example: 10,
                                },
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        './src/features/**/*.ts', // Include all feature files
        './src/routes/**/*.ts',   // Include all route files
    ],
};