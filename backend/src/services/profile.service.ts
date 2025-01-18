import { PrismaClient } from "@prisma/client";
import { BlobUtil, FileData } from "../utils/blob.util";
import { DEFAULT_PROFILE } from "../config";

export class ProfileService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async getProfile(userId: bigint, viewerId: bigint | null): Promise<object> {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            include: {
                connection_connection_from_idTousers: {
                    select: {
                        to_id: true,
                        users_connection_to_idTousers: { select: { id: true, username: true } },
                    },
                },
                connection_connection_to_idTousers: {
                    select: {
                        from_id: true,
                        users_connection_from_idTousers: { select: { id: true, username: true } },
                    },
                },
                feed: {
                    select: {
                        content: true,
                    },
                    orderBy: { created_at: "desc" },
                    take: 5, 
                },
                connection_request_connection_request_from_idTousers: viewerId
                    ? { where: { to_id: viewerId }, select: { from_id: true, to_id: true } }
                    : false,
                connection_request_connection_request_to_idTousers: viewerId
                    ? { where: { from_id: viewerId }, select: { from_id: true, to_id: true } }
                    : false,
            },
        });
    
        if (!user) {
            throw new Error("User not found");
        }
    
        const connectionCount =
            user.connection_connection_from_idTousers.length +
            user.connection_connection_to_idTousers.length;
        
        const isOwner = viewerId === userId;
        const isConnected =
            user.connection_connection_from_idTousers.some((c) => c.to_id === viewerId) ||
            user.connection_connection_to_idTousers.some((c) => c.from_id === viewerId);
    
        let connectionStatus: "none" | "sent" | "received" = "none";
        if (viewerId) {
            const sentRequest =
                user.connection_request_connection_request_to_idTousers?.find((req) => req.to_id === viewerId);
            const receivedRequest =
                user.connection_request_connection_request_from_idTousers?.find((req) => req.from_id === viewerId);
    
            if (sentRequest) {
                connectionStatus = "sent";
            } else if (receivedRequest) {
                connectionStatus = "received";
            }
        }
    
        const baseProfile = {
            id: user.id.toString(),
            username: user.username,
            name: user.full_name,
            profile_photo_path: user.profile_photo_path,
            work_history: user.work_history,
            skills: user.skills,
            connection_count: connectionCount,
        };
    
        if (!viewerId){
            return baseProfile;
        }
        if (isOwner) {
            return {
                ...baseProfile,
                relevant_posts: user.feed,
                isOwner,
            };
        }
    
        if (isConnected) {
            return {
                ...baseProfile,
                relevant_posts: user.feed,
                isConnected,
            };
        }
    
        return {
            ...baseProfile,
            relevant_posts: user.feed,
            isConnected: false,
            connectionStatus,
        };
    }

    public async updateProfile(
        userId: bigint,
        data: {
            fullName?: string;
            workHistory?: string;
            skills?: string;
            username?: string;
            newProfilePhoto?: FileData; 
        }
    ): Promise<object> {
        return this.prisma.$transaction(async (prisma) => {
            let newProfilePhotoUrl: string | undefined;

            const user = await prisma.users.findUnique({
                where: { id: userId },
                select: { profile_photo_path: true },
            });

            if (!user) {
                throw new Error("User not found");
            }

            if (data.newProfilePhoto) {
                if (user.profile_photo_path && user.profile_photo_path !== DEFAULT_PROFILE) {
                    await BlobUtil.deleteFile(user.profile_photo_path);
                }

                newProfilePhotoUrl = (
                    await BlobUtil.uploadFile(
                        data.newProfilePhoto.buffer,
                        data.newProfilePhoto.fileName,
                        data.newProfilePhoto.mimeType
                    )
                ).url;
            }

            if (data.username) {
                if (data.username.length === 0) {
                    throw new Error("Username cannot be empty!");
                }

                const existingUser = await prisma.users.findUnique({
                    where: { username: data.username },
                });

                if (existingUser && existingUser.id !== userId) {
                    throw new Error("Username is already in use");
                }

                await prisma.users.update({
                    where: { id: userId },
                    data: { username: data.username },
                });
            }

            if (data.fullName?.length === 0) {
                throw new Error("Full Name cannot be empty!");
            }

            const updatedUser = await prisma.users.update({
                where: { id: userId },
                data: {
                    full_name: data.fullName,
                    profile_photo_path: newProfilePhotoUrl,
                    work_history: data.workHistory,
                    skills: data.skills,
                },
            });

            return {
                userId: updatedUser.id.toString(),
                fullName: updatedUser.full_name,
                profilePhotoPath: updatedUser.profile_photo_path,
                workHistory: updatedUser.work_history,
                skills: updatedUser.skills,
                username: updatedUser.username,
            };
        });
    }
}
