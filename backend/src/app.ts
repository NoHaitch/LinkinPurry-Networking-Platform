import express, { Application } from "express";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes"
import connectionRoutes from "./routes/connection.routes"
import feedRoutes from "./routes/feed.routes"
import chatRoutes from "./routes/chat.routes"
import pushRoutes from "./routes/push.routes"
import healthRoutes from "./routes/health.routes"
import cors from "cors"
import cookieParser from "cookie-parser";
import http from "http";
import { Server, Socket } from "socket.io";
import { ChatService } from "./services/chat.service";
import { ProfileService } from "./services/profile.service";
import { PushSubscriptionService } from "./services/push.service";
import { sendNotificationToAll } from "./utils/push.util";
import { AuthMiddleware } from "./middlewares/auth.middleware";

export class App {
    private app: Application;
    private server: http.Server;
    private io: Server;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ["websocket"],
        });
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeSocket();
    }

    private initializeMiddleware(): void {
        this.app.use(express.json());
        this.app.use(
            cors({
                origin: [
                    "http://localhost:5173",
                ],
                methods: ["GET", "POST", "PUT", "DELETE"],
                credentials: true,
            })
        );
        this.app.use(cookieParser());
    }

    private initializeRoutes(): void {
        this.app.use("/api", authRoutes);
        this.app.use("/api", profileRoutes);
        this.app.use("/api", connectionRoutes);
        this.app.use("/api", feedRoutes);
        this.app.use("/api", chatRoutes);
        this.app.use("/api", pushRoutes);
        this.app.use(healthRoutes);
    }

    private initializeSocket(): void {
        const chatService = new ChatService();
        const profileService = new ProfileService();
        const pushSubscriptionService = new PushSubscriptionService();

        this.io.use(AuthMiddleware.isAuthenticatedSocket);
        this.io.on("connection", (socket: Socket) => {
            console.log(`User connected: ${socket.id}`);

            socket.on("joinRoom", async ({ userId }: { userId: bigint }) => {
                socket.join(`room-${userId}`);
            });

            socket.on("typing", async ({ fromId, toId }: { fromId: bigint; toId: bigint }) => {
                try{
                    const isConnected = await chatService.isConnected(fromId, toId);
                    if (!isConnected) {
                        throw new Error('Cannot send message to non-connected user');
                    }
                    socket.to(`room-${toId}`).emit("userTyping", { fromId });
                } catch (error: any){
                    socket.emit("error", error.message);
                }
            });

            socket.on("stopTyping", async ({ fromId, toId }: { fromId: bigint; toId: bigint }) => {
                try{
                    const isConnected = await chatService.isConnected(fromId, toId);
                    if (!isConnected) {
                        throw new Error('Cannot send message to non-connected user');
                    }
                    socket.to(`room-${toId}`).emit("userStopTyping", { fromId });
                } catch (error: any){
                    socket.emit("error", error.message);
                }
            });

            socket.on("sendMessage", async ({ fromId, toId, message }: { fromId: bigint; toId: bigint; message: string }) => {
                try {
                    const isConnected = await chatService.isConnected(fromId, toId);
                    if (!isConnected) {
                        throw new Error('Cannot send message to non-connected user');
                    }
                    const newMessage = await chatService.sendChat(fromId, toId, message);
                    const { name } = await profileService.getProfile(fromId, null) as any;
                    const subscriptions = await pushSubscriptionService.getSubscriptionByUserId(toId) as any;
                    if (subscriptions.length > 0) {
                        const pushData = {
                            title: "New message",
                            body: `${name}: ${message}`,
                            url: '/messaging/' + fromId
                        };
                        await sendNotificationToAll(subscriptions, pushData);
                    }
                    socket.to(`room-${toId}`).emit("receiveMessage", newMessage);
                } catch (error: any) {
                    socket.emit("error", error.message);
                }
            });

            socket.on("disconnect", () => {
                console.log("User disconnected");
            });
        });
    }

    public listen(port: number): void {
        this.server.listen(port, () => {
            console.log(`[INFO] Server running on port ${port}`);
        });
    }
}
