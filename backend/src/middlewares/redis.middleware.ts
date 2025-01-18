import { Request, Response, NextFunction } from "express";
import redisClient from "../redisClient";

export class RedisMiddleware {
    public static async redisCache(req: Request, res: Response, next: NextFunction): Promise<any> {
        const cacheKey = `cache_${req.originalUrl}&id=${req.body.user?.id}`;
        console.log(cacheKey)
        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log(`Cache hit for ${cacheKey}`);
                return res.json(JSON.parse(cachedData));
            }

            console.log(`Cache miss for ${cacheKey}`);
            next();
        } catch (error) {
            console.error("Error checking cache:", error);
            next();
        }
    }

    public static async cacheInvalidate(req: Request, res: Response, next: NextFunction): Promise<void> {
        const cacheKeyPattern = req.url !== '/register' && !req.url.includes('connection') ? `cache_${req.originalUrl}*` : `cache_/api/connection/users*`;
        let parentPatterns: any = []
        if (!req.url.includes('connection')) {
            parentPatterns.push(`${cacheKeyPattern.split('/').slice(0, -1).join('/')}*`)
        } else {
            parentPatterns.push(`cache_/api/feed*`);
            parentPatterns.push(`cache_/api/profile/*`);
        } 

        try {
            let cursor = '0';
            do {
                const [newCursor, keys] = await redisClient.scan(cursor, 'MATCH', cacheKeyPattern);
                cursor = newCursor;
                if (keys.length > 0) {
                    await redisClient.del(...keys);
                    console.log(`Invalidated cache for keys:`, keys);
                }
            } while (cursor !== '0');
            cursor = '0';
            for (const pattern of parentPatterns) {
                cursor = '0'; // Reset cursor for each pattern
                do {
                    const [newCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern);
                    cursor = newCursor;
                    if (keys.length > 0) {
                        await redisClient.del(...keys);
                        console.log(`Invalidated cache for pattern: ${pattern}, keys:`, keys);
                    }
                } while (cursor !== '0');
            }
        } catch (error) {
            console.error("Error invalidating cache:", error);
        }

        next();
    }

    public static async setRedisCache(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const cacheKey = `cache_${req.originalUrl}&id=${req.body.user?.id}`;
            if (cacheKey && res.locals.data) {
                await redisClient.set(cacheKey, JSON.stringify(res.locals.data),
                    'EX', 3600);
            }
        } catch (error) {
            console.error("Error setting cache:", error);
        }
        next();
    }
}
