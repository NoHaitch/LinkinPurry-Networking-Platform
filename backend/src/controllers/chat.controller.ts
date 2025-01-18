import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { errorResponse, successResponse } from "../utils/response.util"; 

export class ChatController {
    private chatService: ChatService;

    constructor() {
        this.chatService = new ChatService();
    }

    public async sendChat(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.body.user.id)
            const toId = BigInt(req.params.to_id);
            const { message } = req.body;

            if (!userId || !toId || !message) {
                res.status(400).json(errorResponse("Invalid data", "Missing required fields"));
            }

            const chat = await this.chatService.sendChat(userId, toId, message);
            res.status(201).json(successResponse("Chat message sent successfully", chat));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to send chat message", error.message));
        }
    }

    public async getChatHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.body.user?.id);
            const targetId = BigInt(req.params.to_id);
            const chatHistory = await this.chatService.getChatHistory(userId, targetId);
            res.status(200).json(successResponse("Chat history fetched successfully", chatHistory));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to fetch chat history", error.message));
        }
    }

    public async getRecentChats(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.body.user?.id);
            const recentChats = await this.chatService.getRecentChats(userId);
            res.status(200).json(successResponse("Recent chats fetched successfully", recentChats))
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to fetch recent chats", error.message));
        }
    }
}
