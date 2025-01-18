import { Router } from "express";
import { FeedController } from "../controllers/feed.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { log } from "../utils/debug.util";
import { RedisMiddleware } from "../middlewares/redis.middleware";

const router = Router();
const feedController = new FeedController();


router.get("/feed", AuthMiddleware.isAuthenticated, RedisMiddleware.redisCache, async (req, res) => {
    log(req);
    await feedController.getFeeds(req, res);
    await RedisMiddleware.setRedisCache(req, res, () => {});
});

router.get("/feed/:feedId", AuthMiddleware.isAuthenticated, async (req, res) => {
    log(req);
    await feedController.getFeed(req, res);
});

router.post("/feed", AuthMiddleware.isAuthenticated, RedisMiddleware.cacheInvalidate, async (req, res) => {
    log(req);
    await feedController.createFeed(req, res);
});

router.put("/feed/:feedId", AuthMiddleware.isAuthenticated, RedisMiddleware.cacheInvalidate, async (req, res) => {
    log(req);
    await feedController.updateFeed(req, res);
});

router.delete("/feed/:feedId", AuthMiddleware.isAuthenticated, RedisMiddleware.cacheInvalidate, async (req, res) => {
    log(req);
    await feedController.deleteFeed(req, res);
});

export default router;
