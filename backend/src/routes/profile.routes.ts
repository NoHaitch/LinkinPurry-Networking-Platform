import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { log } from "../utils/debug.util";
import { RedisMiddleware } from "../middlewares/redis.middleware";

const router = Router();
const profileController = new ProfileController();

router.get("/profile/:userId", AuthMiddleware.isAuthenticatedOptional, RedisMiddleware.redisCache, async (req, res) => {
    log(req); 
    await profileController.getProfile(req, res);
    await RedisMiddleware.setRedisCache(req, res, () => { });
});

router.put("/profile/:userId",
    AuthMiddleware.isAuthenticated,
    RedisMiddleware.cacheInvalidate,
    profileController.uploadMiddleware,
    async (req, res) => {
        log(req);
        await profileController.updateProfile(req, res);
    });

export default router;
