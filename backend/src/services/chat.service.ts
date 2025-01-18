import { PrismaClient } from "@prisma/client";
import { convertToString } from "../utils/converter.util";

export class ChatService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async sendChat(from_id: bigint, to_id: bigint, message: string): Promise<any> {
        try {
            const connectionExists = await this.prisma.connection.findFirst({
                where: {
                    OR: [
                        { from_id, to_id },
                        { from_id: to_id, to_id: from_id },
                    ],
                },
            });

            if (!connectionExists) {
                throw new Error("Users are not connected. Cannot send a chat message.");
            }

            const chat = await this.prisma.chat.create({
                data: {
                    from_id,
                    to_id,
                    message,
                    timestamp: new Date(),
                },
            });
            return convertToString(chat);
        } catch (error: any) {
            throw new Error("Error sending chat message: " + error.message);
        }
    }

    public async getChatHistory(from_id: bigint, to_id: bigint): Promise<any> {
        try {
            const connectionExists = await this.prisma.connection.findFirst({
                where: {
                    OR: [
                        { from_id, to_id },
                        { from_id: to_id, to_id: from_id },
                    ],
                },
            });

            if (!connectionExists) {
                throw new Error("Users are not connected. Cannot fetch chat history.");
            }

            const chatHistory = await this.prisma.chat.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                { from_id: from_id },
                                { to_id: from_id },
                            ]
                        },
                        {
                            OR: [
                                { from_id: to_id },
                                { to_id: to_id },
                            ]
                        }
                    ]
                },
                orderBy: {
                    timestamp: "asc",
                },
            });

            return convertToString(chatHistory);
        } catch (error: any) {
            throw new Error("Error fetching chat history: " + error.message);
        }
    }

    public async getRecentChats(user_id: bigint): Promise<any> {
        try {
            const connections = await this.prisma.connection.findMany({
                where: {
                    OR: [
                        { from_id: user_id },
                        { to_id: user_id },
                    ],
                },
                select: {
                    from_id: true,
                    to_id: true,
                },
            });

            const recentChats: {[key: string]: object} = {};

            for (const connection of connections) {
                const lastMessage = await this.prisma.chat.findFirst({
                    where: {
                        OR: [
                            { from_id: connection.from_id, to_id: connection.to_id },
                            { from_id: connection.to_id, to_id: connection.from_id },
                        ],
                    },
                    orderBy: {
                        timestamp: 'desc',
                    },
                    select: {
                        from_id: true,
                        to_id: true,
                        message: true,
                        timestamp: true,
                    },
                });

                if (lastMessage) {
                    const otherUserId = lastMessage.from_id === user_id ? lastMessage.to_id : lastMessage.from_id;
                    recentChats[otherUserId.toString()] = lastMessage;
                }
            }
            return convertToString(recentChats);
        } catch (error: any) {
            throw new Error('Error fetching recent chats: ' + error.message);
        }
    }

    public async isConnected(user_id: bigint, target_id: bigint): Promise<any>{
        const connection = await this.prisma.connection.findFirst({
            where: {
                OR: [
                    { from_id: user_id, to_id: target_id },
                    { from_id: target_id, to_id: user_id },
                ],
            },
            select: {
                from_id: true,
                to_id: true,
            },
        });
        
        return !!connection;
    }
}
