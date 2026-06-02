import { createClient } from "redis"

if (!process.env.REDIS_URL) throw new Error('REDIS_URL is not defined');

export const redisClient = createClient({
    url: process.env.REDIS_URL
})