import { Router } from "express";
import { PushController } from "../controllers/push.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware"; 
import { log } from "../utils/debug.util"; 

const router = Router();
const pushController = new PushController();

router.post("/push/subscription", 
    AuthMiddleware.isAuthenticated,
    (req, res) => {
        log(req);
        pushController.saveSubscription(req, res);
    }
);

router.delete("/push/subscription", 
    AuthMiddleware.isAuthenticated, 
    (req, res) => {
        log(req);
        pushController.deleteSubscription(req, res);
    }
);

router.post("/push/send-notification", 
    AuthMiddleware.isAuthenticated, 
    (req, res) => {
        log(req);
        pushController.sendNotificationToUser(req, res);
    }
);

router.post("/push/send-notification-to-users", 
    AuthMiddleware.isAuthenticated, 
    (req, res) => {
        log(req);
        pushController.sendNotificationToAllUsers(req, res);
    }
);

export default router;
