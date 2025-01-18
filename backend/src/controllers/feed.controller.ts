import { Request, Response } from "express";
import { FeedService } from "../services/feed.service";
import { successResponse, errorResponse } from "../utils/response.util";
import { ConnectionService } from "../services/connection.service";
import { PushSubscriptionService } from "../services/push.service";
import { sendNotificationToAll } from "../utils/push.util";
import { ProfileService } from "../services/profile.service";
import { ChatService } from "../services/chat.service";
import { convertToString } from "../utils/converter.util";

export class FeedController {
    private feedService: FeedService;
    private connectionService: ConnectionService;
    private pushSubscriptionService: PushSubscriptionService;
    private profileService: ProfileService;

    constructor() {
        this.feedService = new FeedService();
        this.connectionService = new ConnectionService();
        this.pushSubscriptionService = new PushSubscriptionService();
        this.profileService = new ProfileService();
    }

    public async getFeeds(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.body.user.id); 
            const { cursor, limit } = req.query;
            const parsedCursor = cursor ? BigInt(cursor as string) : undefined;
            const parsedLimit = limit ? parseInt(limit as string, 10) : 10;

            const feeds = await this.feedService.getFeeds(userId, parsedCursor, parsedLimit);
            res.locals.data = successResponse("Feeds fetched successfully", feeds);
            res.status(200).json(successResponse("Feeds fetched successfully", feeds));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to fetch feeds", error.message));
        }
    }
    public async getFeed(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.body.user.id); 
            const feedId = BigInt(req.params.feedId)
            const feed = await this.feedService.getFeed(feedId) as any;
            const feedOwner  = BigInt(feed.users.id);
            const connectionService = new ChatService();
            const isConnected = await connectionService.isConnected(feedOwner, userId);
            if(feedOwner !== userId && !isConnected){
                throw new Error('Cannot fetch feed from unconnected users')
            }
            res.status(200).json(successResponse("Feeds fetched successfully", convertToString(feed)));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to fetch feeds", error.message));
        }
    }

    public async createFeed(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.body.user.id); 
            const { content } = req.body;

            if (!content || content.trim() === "") {
                throw new Error("Content cannot be empty");
            }
            if (content.length > 280){
                throw new Error("Content must contain at most 280 characters")
            }
            const newFeed = await this.feedService.createFeed(userId, content) as any;
            
            const connections = await this.connectionService.getConnections(userId);
            
            const connectedUserIds = connections.map((connection: any) => connection.id);
            const subscriptions = await this.pushSubscriptionService.getAllSubscriptions(connectedUserIds) as any;

            const {name} = await this.profileService.getProfile(userId, null) as any;

            const notificationData = {
                title: "New Feed Posted",
                body: `New post by user ${name}!`,
                url: '/feed/'+newFeed.id,
            };

            await sendNotificationToAll(subscriptions, notificationData);
            res.status(200).json(successResponse("Feed created successfully", newFeed));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to create feed", error.message));
        }
    }

    public async updateFeed(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.body.user.id); 
            const feedId = BigInt(req.params.feedId);
            const { content } = req.body;

            if (!content || content.trim() === "") {
                throw new Error("Content cannot be empty");
            }

            if (content.length > 280){
                throw new Error("Content must contain at most 280 characters")
            }
            
            const updatedFeed = await this.feedService.updateFeed(feedId, userId, content);
            res.status(200).json(successResponse("Feed updated successfully", updatedFeed));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to update feed", error.message));
        }
    }

    public async deleteFeed(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.body.user.id);
            const feedId = BigInt(req.params.feedId);

            await this.feedService.deleteFeed(feedId, userId);
            res.status(200).json(successResponse("Feed deleted successfully", {}));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to delete feed", error.message));
        }
    }
}
