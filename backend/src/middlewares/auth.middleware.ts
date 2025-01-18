import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util";
import { errorResponse } from "../utils/response.util";
import { Socket } from "socket.io";
import cookie from "cookie";

export class AuthMiddleware {
    public static isAuthenticated(req: Request, res: Response, next: NextFunction): void  {
        let token = "";

        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            res.status(401).json(errorResponse("Unauthorized access", "Missing token in cookies"));
            return;
        }

        try {
            const decoded = verifyToken(token);
            req.body.user = { id: BigInt(decoded.userId) };
            next();
        } catch (error: any) {
            res.status(401).json(errorResponse("Unauthorized access", error.message));
        }
    }

    public static isAuthenticatedOptional(req: Request, res: Response, next: NextFunction): void {
        let token = "";
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            try {
                const decoded = verifyToken(token);
                req.body.user = { id: BigInt(decoded.userId) };
            } catch {}
        }

        next();
    }
    public static isAuthenticatedSocket(socket: Socket, next: Function) {
        const cookies = socket.handshake.headers.cookie;
        const parsedCookies = cookies ? cookie.parse(cookies) : {};
        const token = parsedCookies['token'];
        if (!token) {
            return next(new Error("Authentication error: No token found"));
        }
    
        try {
            verifyToken(token);
            next();
        } catch (error) {
            return next(new Error("Authentication error: Invalid token"));
        }
    };
}
