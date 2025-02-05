import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 10;

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip;
    const key = `ratelimit:${ip}`;

    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expire(key, WINDOW_SIZE_IN_SECONDS);
    }

    if (requests > MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        error: 'Too many requests, please try again later',
        retryAfter: await redis.ttl(key)
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // If Redis fails, allow the request to proceed
    next();
  }
}; 