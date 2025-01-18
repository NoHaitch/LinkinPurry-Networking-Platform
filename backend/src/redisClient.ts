import Redis from 'ioredis';
import { REDIS_URL } from './config';

const redisClient = new Redis(REDIS_URL);

redisClient.on('connect', () => {
    console.log("Connected to Redis server");
});

redisClient.on('error', (err) => {
    console.error("Redis error:", err);
});

export default redisClient;
