import { PrismaClient } from "@prisma/client";
import { convertToString } from "../utils/converter.util";

export class ConnectionService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async getUsers(search?: string, userId?: bigint, targetId?: bigint, take?: number): Promise<object[]> {
        let users;
        if(take){
            users = await this.prisma.users.findMany({
                where: { 
                    NOT:{
                        OR:[
                            {id: userId},
                            {id: targetId}
                        ]
                    }
                 },
                take: take?? undefined,
                select: {
                    id: true,
                    full_name: true,
                    profile_photo_path: true,
                },
            });

        } else{
            users = await this.prisma.users.findMany({
                where: { full_name: { contains: search, mode: "insensitive" } },
                select: {
                    id: true,
                    full_name: true,
                    profile_photo_path: true,
                },
            });
        }

    
        if (!userId) {
            return convertToString(users.map((user) => ({ ...user, isConnected: false })));
        }
    
        const firstDegreeConnections = await this.prisma.connection.findMany({
            where: {
                OR: [
                    { from_id: userId },
                    { to_id: userId },
                ],
            },
        });
    
        const firstDegreeUserIds = new Set<bigint>();
        firstDegreeConnections.forEach((connection) => {
            if (connection.from_id !== userId) firstDegreeUserIds.add(connection.from_id);
            if (connection.to_id !== userId) firstDegreeUserIds.add(connection.to_id);
        });
    
        const secondDegreeConnections = await this.prisma.connection.findMany({
            where: {
                OR: [
                    { from_id: { in: Array.from(firstDegreeUserIds) } },
                    { to_id: { in: Array.from(firstDegreeUserIds) } },
                ],
            },
        });
    
        const secondDegreeUserIds = new Set<bigint>();
        secondDegreeConnections.forEach((connection) => {
            if (!firstDegreeUserIds.has(connection.from_id) && connection.from_id !== userId) {
                secondDegreeUserIds.add(connection.from_id);
            }
            if (!firstDegreeUserIds.has(connection.to_id) && connection.to_id !== userId) {
                secondDegreeUserIds.add(connection.to_id);
            }
        });
    
        const thirdDegreeConnections = await this.prisma.connection.findMany({
            where: {
                OR: [
                    { from_id: { in: Array.from(secondDegreeUserIds) } },
                    { to_id: { in: Array.from(secondDegreeUserIds) } },
                ],
            },
        });
    
        const thirdDegreeUserIds = new Set<bigint>();
        thirdDegreeConnections.forEach((connection) => {
            if (
                !firstDegreeUserIds.has(connection.from_id) &&
                !secondDegreeUserIds.has(connection.from_id) &&
                connection.from_id !== userId
            ) {
                thirdDegreeUserIds.add(connection.from_id);
            }
            if (
                !firstDegreeUserIds.has(connection.to_id) &&
                !secondDegreeUserIds.has(connection.to_id) &&
                connection.to_id !== userId
            ) {
                thirdDegreeUserIds.add(connection.to_id);
            }
        });
    
        const usersWithConnectionStatus = users.map((user) => ({
            ...user,
            isConnected: firstDegreeUserIds.has(user.id),
            isSecondDegree: secondDegreeUserIds.has(user.id),
            isThirdDegree: thirdDegreeUserIds.has(user.id),
            isOwner: user.id === userId,
        }));
    
        return convertToString(usersWithConnectionStatus);
    }

    public async sendConnectionRequest(fromId: bigint, toId: bigint): Promise<object> {
        if (fromId === toId) {
            throw new Error("You cannot send a connection request to yourself");
        }
        
        const existingCount = await this.prisma.users.count({
            where: {
                id: { in: [fromId, toId] }, 
            },
        });
        
        if (existingCount !== 2) {
            throw new Error("User doesn't exist");
        }

        const existingRequest = await this.prisma.connection_request.findFirst({
            where: {
                OR: [
                    { from_id: fromId, to_id: toId },
                    { from_id: toId, to_id: fromId },
                ],
            },
        });
        
        const existingConnection = await this.prisma.connection.findFirst({
            where: {
                OR: [
                    { from_id: fromId, to_id: toId },
                    { from_id: toId, to_id: fromId },
                ],
            },
        });

        if (existingRequest) {
            throw new Error("Connection request already sent");
        }

        if (existingConnection){
            throw new Error("Connection already exist");
        }

        const request = await this.prisma.connection_request.create({
            data: {
                from_id: fromId,
                to_id: toId,
                created_at: new Date()
            },
        });

        return convertToString(request);
    }

    public async getPendingRequests(userId: bigint): Promise<object[]> {
        const requests = await this.prisma.connection_request.findMany({
            where: { to_id: userId },
            orderBy: { created_at: "desc" },
            select: {
                from_id: true,
                created_at: true,
                users_connection_request_from_idTousers: {
                    select: {
                        id: true,
                        full_name: true,
                        profile_photo_path: true,
                    },
                },
            },
        });

        return convertToString(requests);
    }

    public async respondToRequest(fromId: bigint, toId: bigint, action: "accept" | "reject"): Promise<void> {
        const request = await this.prisma.connection_request.findUnique({
            where: { from_id_to_id: { from_id: fromId, to_id: toId } },
        });

        if (!request) {
            throw new Error("Connection request not found");
        }

        await this.prisma.connection_request.delete({
            where: { from_id_to_id: { from_id: fromId, to_id: toId } },
        });

        if (action === "accept") {
            await this.prisma.connection.create({
                data: {
                    from_id: fromId,
                    to_id: toId,
                    created_at: new Date()
                },
            });
        }
    }

    public async getConnections(userId: bigint): Promise<object[]> {
        const outgoing = await this.prisma.connection.findMany({
            where: { from_id: userId },
            select: {
                users_connection_to_idTousers: {
                    select: {
                        id: true,
                        full_name: true,
                        profile_photo_path: true,
                    },
                },
            },
        });

        const incoming = await this.prisma.connection.findMany({
            where: { to_id: userId },
            select: {
                users_connection_from_idTousers: {
                    select: {
                        id: true,
                        full_name: true,
                        profile_photo_path: true,
                    },
                },
            },
        });

        return convertToString([
            ...outgoing.map((c) => c.users_connection_to_idTousers),
            ...incoming.map((c) => c.users_connection_from_idTousers),
        ]);
    }

    public async removeConnection(userId: bigint, targetUserId: bigint): Promise<void> {
        const connection = await this.prisma.connection.findFirst({
            where: {
                OR: [
                    { from_id: userId, to_id: targetUserId },
                    { from_id: targetUserId, to_id: userId },
                ],
            },
        });

        if (!connection) {
            throw new Error("Connection does not exist");
        }

        await this.prisma.$transaction(async (prisma) => {
            await prisma.chat.deleteMany({
                where: {
                    OR: [
                        { from_id: userId, to_id: targetUserId },
                        { from_id: targetUserId, to_id: userId },
                    ],
                },
            });
        
            await prisma.connection.delete({
                where: {
                    from_id_to_id: {
                        from_id: connection.from_id,
                        to_id: connection.to_id,
                    },
                },
            });
        });
        
    }

    public async getConnectionDegree(userId: bigint, viewerId?: bigint): Promise<string> {
        if (!viewerId|| userId === viewerId) {
            return ""; 
        }
    
        const firstDegreeConnection = await this.prisma.connection.findFirst({
            where: {
                OR: [
                    { from_id: userId, to_id: viewerId },
                    { from_id: viewerId, to_id: userId },
                ],
            },
        });
    
        if (firstDegreeConnection) {
            return "1st";
        }
    
        const userConnections = await this.prisma.connection.findMany({
            where: {
                OR: [
                    { from_id: userId },
                    { to_id: userId },
                ],
            },
        });
    
        const firstDegreeUserIds = new Set<bigint>();
        userConnections.forEach((connection) => {
            if (connection.from_id !== userId) firstDegreeUserIds.add(connection.from_id);
            if (connection.to_id !== userId) firstDegreeUserIds.add(connection.to_id);
        });
    
        const secondDegreeUserIds = new Set<bigint>();
        for (const id of firstDegreeUserIds) {
            const secondDegreeConnections = await this.prisma.connection.findMany({
                where: {
                    OR: [
                        { from_id: id },
                        { to_id: id },
                    ],
                },
            });
    
            for (const connection of secondDegreeConnections) {
                if (connection.from_id === viewerId || connection.to_id === viewerId) {
                    return "2nd";
                }
    
                if (connection.from_id !== id && !firstDegreeUserIds.has(connection.from_id)) {
                    secondDegreeUserIds.add(connection.from_id);
                }
                if (connection.to_id !== id && !firstDegreeUserIds.has(connection.to_id)) {
                    secondDegreeUserIds.add(connection.to_id);
                }
            }
        }
    
        for (const id of secondDegreeUserIds) {
            const thirdDegreeConnections = await this.prisma.connection.findMany({
                where: {
                    OR: [
                        { from_id: id },
                        { to_id: id },
                    ],
                },
            });
    
            for (const connection of thirdDegreeConnections) {
                if (connection.from_id === viewerId || connection.to_id === viewerId) {
                    return "3rd";
                }
            }
        }
    
        return "";
    }
}
