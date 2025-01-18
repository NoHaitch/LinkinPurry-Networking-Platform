import { Router } from "express";
import { ConnectionController } from "../controllers/connection.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { log } from "../utils/debug.util";
import { RedisMiddleware } from "../middlewares/redis.middleware";

const router = Router();
const connectionController = new ConnectionController();

router.get("/connection/users", AuthMiddleware.isAuthenticatedOptional, RedisMiddleware.redisCache,async (req, res) => {
    log(req);
    await connectionController.getUsers(req, res);
    await RedisMiddleware.setRedisCache(req,res, () => {});
});

router.get("/connection/recommendations", AuthMiddleware.isAuthenticatedOptional,async (req, res) => {
    log(req);
    await connectionController.getUsers(req, res);
});
router.post("/connection/:userId/request", AuthMiddleware.isAuthenticated, async (req, res) => {
    log(req);
    await connectionController.sendRequest(req, res);
});
router.get("/connection/requests", AuthMiddleware.isAuthenticated, async (req, res) => {
    log(req);
    await connectionController.getPendingRequests(req, res);
});
router.post("/connection/:userId/respond", AuthMiddleware.isAuthenticated, RedisMiddleware.cacheInvalidate, async (req, res) => {
    log(req);
    await connectionController.respondToRequest(req, res);
});
router.get("/connection/:userId/connections", AuthMiddleware.isAuthenticatedOptional, async (req, res) => {
    log(req);
    await connectionController.getConnections(req, res);
});

router.get("/connection-degree/:userId", AuthMiddleware.isAuthenticatedOptional, async (req, res) => {
    log(req);
    await connectionController.getConnectionDegree(req, res);
});
router.delete("/connection/:userId/", AuthMiddleware.isAuthenticated, RedisMiddleware.cacheInvalidate, async (req, res) => {
    log(req);
    await connectionController.removeConnection(req,res);
})
export default router;
