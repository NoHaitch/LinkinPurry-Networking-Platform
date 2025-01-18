import { Request, Response } from "express";
import { PushSubscriptionService } from "../services/push.service";
import { sendNotification, sendNotificationToAll } from "../utils/push.util";
import { successResponse, errorResponse } from "../utils/response.util";

export class PushController {
    private pushSubscriptionService: PushSubscriptionService;

    constructor() {
        this.pushSubscriptionService = new PushSubscriptionService();
    }

    public async saveSubscription(req: Request, res: Response): Promise<void> {
        try {
            const { endpoint, keys } = req.body;
            const userId = BigInt(req.body.user.id); 

            const subscription = await this.pushSubscriptionService.saveSubscription(endpoint, userId, keys);
            res.status(200).json(successResponse("Subscription saved successfully", subscription));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to save subscription", error.message));
        }
    }

    public async deleteSubscription(req: Request, res: Response): Promise<void> {
        try {
            const { endpoint } = req.body;
            await this.pushSubscriptionService.deleteSubscription(endpoint);
            res.status(200).json(successResponse("Subscription deleted successfully", {}));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to delete subscription", error.message));
        }
    }

    public async sendNotificationToUser(req: Request, res: Response): Promise<void> {
        try {
            const { endpoint, data } = req.body;
            const subscription = await this.pushSubscriptionService.getSubscriptionByEndpoint(endpoint) as any;

            if (!subscription) {
                throw new Error("Subscription not found");
            }

            const pushSubscription = {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            };

            const result = await sendNotification(pushSubscription, data);
            res.status(200).json(successResponse("Notification sent successfully", result));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to send notification", error.message));
        }
    }

    public async sendNotificationToAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const { data, userIds } = req.body; 
            const userIdList = userIds.map((id: string) => BigInt(id)); 

            const subscriptions = await this.pushSubscriptionService.getAllSubscriptions(userIdList);

            const pushSubscriptions = subscriptions.map((subscription) => ({
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            })) as any;

            const results = await sendNotificationToAll(pushSubscriptions, data);
            res.status(200).json(successResponse("Notifications sent to all users", results));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to send notifications to all users", error.message));
        }
    }
}
