import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware"; 
import { log } from "../utils/debug.util";

const router = Router();
const chatController = new ChatController();

router.get("/chat/recents", AuthMiddleware.isAuthenticated, (req, res) => {
    log(req);
    chatController.getRecentChats(req, res);
})

router.get("/chat/:to_id", AuthMiddleware.isAuthenticated, (req, res) => {
    log(req);
    chatController.getChatHistory(req, res);
});
export default router;
