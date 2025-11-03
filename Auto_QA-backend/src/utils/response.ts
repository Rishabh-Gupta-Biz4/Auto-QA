import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export class ResponseHandler {
    static success<T>(
        res: Response,
        message: string,
        data?: T,
        statusCode: number = 200
    ): Response<ApiResponse<T>> {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    static created<T>(
        res: Response,
        message: string,
        data?: T
    ): Response<ApiResponse<T>> {
        return res.status(201).json({
            success: true,
            message,
            data,
        });
    }

    static badRequest(
        res: Response,
        message: string,
        data?: any
    ): Response<ApiResponse> {
        return res.status(400).json({
            success: false,
            message,
            data,
        });
    }

    static unauthorized(
        res: Response,
        message: string = 'Unauthorized'
    ): Response<ApiResponse> {
        return res.status(401).json({
            success: false,
            message,
        });
    }

    static forbidden(
        res: Response,
        message: string = 'Forbidden'
    ): Response<ApiResponse> {
        return res.status(403).json({
            success: false,
            message,
        });
    }

    static notFound(
        res: Response,
        message: string = 'Resource not found'
    ): Response<ApiResponse> {
        return res.status(404).json({
            success: false,
            message,
        });
    }

    static conflict(
        res: Response,
        message: string
    ): Response<ApiResponse> {
        return res.status(409).json({
            success: false,
            message,
        });
    }

    static internalError(
        res: Response,
        message: string = 'Internal server error'
    ): Response<ApiResponse> {
        return res.status(500).json({
            success: false,
            message,
        });
    }

    static error(
        res: Response,
        error: string,
        statusCode: number = 400
    ): Response<ApiResponse> {
        return res.status(statusCode).json({
            success: false,
            error,
        });
    }

    static paginated<T>(
        res: Response,
        data: T[],
        page: number,
        limit: number,
        total: number,
        message?: string
    ): Response<ApiResponse<T[]>> {
        const pages = Math.ceil(total / limit);
        
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                page,
                limit,
                total,
                pages,
            },
        });
    }
}
