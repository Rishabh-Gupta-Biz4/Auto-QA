import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // Number of requests
    duration: Math.floor(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10) / 1000), // Per second(s)
});

export const rateLimiterMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await rateLimiter.consume(req.ip || 'unknown');
        next();
    } catch (rateLimiterRes: any) {
        const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
        
        console.warn(`Rate limit exceeded for IP: ${req.ip}`);
        
        res.set('Retry-After', String(secs));
        res.status(429).json({
            success: false,
            error: 'Too many requests, please try again later.',
            retryAfter: secs
        });
    }
};

// Export with different name to avoid confusion
export { rateLimiterMiddleware as rateLimiter };