import { PrismaClient } from "@prisma/client";
import { convertToString } from "../utils/converter.util";

export class FeedService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async getFeeds(userId: bigint, cursor?: bigint, limit: number = 10): Promise<object> {
        const connections = await this.prisma.connection.findMany({
            where: {
                OR: [
                    { from_id: userId },
                    { to_id: userId },
                ],
            },
            select: {
                from_id: true,
                to_id: true,
            },
        });

        const connectedUserIds = new Set<bigint>();
        connections.forEach((connection) => {
            connectedUserIds.add(connection.from_id);
            connectedUserIds.add(connection.to_id);
        });

        connectedUserIds.add(userId)

        const feeds = await this.prisma.feed.findMany({
            where: {
                user_id: {
                    in: Array.from(connectedUserIds),
                },
                ...(cursor ? { id: { lt: cursor } } : {}),
            },
            orderBy: { id: "desc" },
            take: limit,
            select: {
                id: true,
                content: true,
                created_at: true,
                updated_at: true,
                users: {
                    select: {
                        id: true,
                        full_name: true,
                        profile_photo_path: true,
                    },
                },
            },
        });

        return convertToString({ feeds, cursor: feeds.length > 0 ? feeds[feeds.length - 1].id.toString() : 0 });
    }

    public async getFeed(feedId: bigint): Promise<object> {
        const feed = await this.prisma.feed.findFirst({
            where: {
                id: feedId
            },
            select: {
                id: true,
                content: true,
                created_at: true,
                updated_at: true,
                users: {
                    select: {
                        id: true,
                        full_name: true,
                        profile_photo_path: true,
                    },
                },
            },
        })
        if(!feed){
            throw new Error('Feed not found!')
        }
        return feed;
    }

    public async createFeed(userId: bigint, content: string): Promise<object> {
        const feed = await this.prisma.feed.create({
            data: {
                content,
                user_id: userId,
            },
            select: {
                id: true,
                content: true,
                created_at: true,
                updated_at: true,
                users: {
                    select: {
                        profile_photo_path: true,
                        full_name: true,
                    }
                }
            },
        });
        return convertToString(feed);
    }

    public async updateFeed(feedId: bigint, userId: bigint, content: string): Promise<object> {
        const existingFeed = await this.prisma.feed.findUnique({
            where: { id: feedId },
        });

        if (!existingFeed) {
            throw new Error("Feed not found");
        }

        if (existingFeed.user_id !== userId) {
            throw new Error("Unauthorized to update this feed");
        }

        const updatedFeed = await this.prisma.feed.update({
            where: { id: feedId },
            data: { content },
            select: {
                id: true,
                content: true,
                updated_at: true,
            },
        });

        return convertToString(updatedFeed);
    }

    public async deleteFeed(feedId: bigint, userId: bigint): Promise<void> {
        const existingFeed = await this.prisma.feed.findUnique({
            where: { id: feedId },
        });

        if (!existingFeed) {
            throw new Error("Feed not found");
        }

        if (existingFeed.user_id !== userId) {
            throw new Error("Unauthorized to delete this feed");
        }

        await this.prisma.feed.delete({
            where: { id: feedId },
        });
    }
}
