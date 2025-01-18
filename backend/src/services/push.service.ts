import { PrismaClient } from "@prisma/client";
import { convertToString } from "../utils/converter.util";

export class PushSubscriptionService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async saveSubscription(endpoint: string, userId: bigint, keys: object) {
        const subscription = await this.prisma.push_subscriptions.upsert({
            where: {
                endpoint,
            },
            update: {
                keys,
                user_id: userId, 
            },
            create: {
                endpoint,
                user_id: userId,
                keys,
            },
        });
        return convertToString(subscription);
    }

    public async getSubscriptionByEndpoint(endpoint: string) {
        const subscription = await this.prisma.push_subscriptions.findUnique({
            where: { endpoint },
        });
        return convertToString(subscription as object);
    }

    public async getSubscriptionByUserId(userId: bigint) {
        const subscription = await this.prisma.push_subscriptions.findMany({
            where: { user_id: userId },
        });
        return convertToString(subscription as object);
    }

    public async deleteSubscription(endpoint: string) {
        await this.prisma.push_subscriptions.delete({
            where: { endpoint },
        });
    }

    public async getAllSubscriptions(userIds: bigint[]) {
        const subscriptions = await this.prisma.push_subscriptions.findMany({
            where: {
                user_id: {
                    in: userIds, 
                },
            },
        });
        return convertToString(subscriptions);
    }
}
