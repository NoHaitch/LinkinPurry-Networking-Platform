import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { log } from "../utils/debug.util";
import { RedisMiddleware } from "../middlewares/redis.middleware";

const router = Router();
const authController = new AuthController();

router.post("/login", (req, res) => { log(req); authController.login(req, res) });
router.post("/register", RedisMiddleware.cacheInvalidate,(req, res) => { log(req); authController.register(req, res) });

export default router;
