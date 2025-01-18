import { Request, Response } from "express";
import { ConnectionService } from "../services/connection.service";
import { successResponse, errorResponse } from "../utils/response.util";
import { escapeSpecialChars } from "../utils/text.util";

export class ConnectionController {
    private connectionService: ConnectionService;

    constructor() {
        this.connectionService = new ConnectionService();
    }

    public async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.body.user?.id? BigInt(req.body.user.id): undefined;
            const targetId = req.query.targetId? BigInt(req.query.targetId as string): undefined;
            const search = req.query.search? escapeSpecialChars(req.query.search as string): "";
            const take = req.query.take? Number(req.query.take): undefined;
            const users = await this.connectionService.getUsers(search, userId, targetId, take);
            res.locals.data = successResponse("Users fetched successfully", users);
            res.status(200).json(successResponse("Users fetched successfully", users));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to fetch users", error.message));
        }
    }

    public async sendRequest(req: Request, res: Response): Promise<void> {
        try {
            const fromId = BigInt(req.body.user.id);
            const toId = BigInt(req.params.userId);
            const result = await this.connectionService.sendConnectionRequest(fromId, toId);
            res.status(200).json(successResponse("Connection request sent", result));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to send connection request", error.message));
        }
    }

    public async getPendingRequests(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.body.user.id);
            const requests = await this.connectionService.getPendingRequests(userId);
            res.status(200).json(successResponse("Pending requests fetched successfully", requests));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to fetch pending requests", error.message));
        }
    }

    public async respondToRequest(req: Request, res: Response): Promise<void> {
        try {
            const toId = BigInt(req.body.user.id);
            const fromId = BigInt(req.params.userId);
            const { action } = req.body;
            if (action !== "accept" && action !== "reject") {
                throw new Error("Invalid action");
            }
            await this.connectionService.respondToRequest(fromId, toId, action);
            res.status(200).json(successResponse(`Connection request ${action}ed successfully`, {}));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to respond to connection request", error.message));
        }
    }

    public async getConnections(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.params.userId);
            const connections = await this.connectionService.getConnections(userId);
            res.status(200).json(successResponse("Connections fetched successfully", connections));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to fetch connections", error.message));
        }
    }
    public async getConnectionDegree(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.params.userId);
            const viewerId = req.body.user?.id? BigInt(req.body.user.id): undefined;
            const degree = await this.connectionService.getConnectionDegree(userId, viewerId);
            res.status(200).json(successResponse("Degree fetched successfully", {degree}));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to fetch degree", error.message));
        }
    }

    public async removeConnection(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.body.user.id); 
            const targetUserId = BigInt(req.params.userId); 
    
            await this.connectionService.removeConnection(userId, targetUserId);
            res.status(200).json(successResponse("Connection removed successfully", {}));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to remove connection", error.message));
        }
    }
}
