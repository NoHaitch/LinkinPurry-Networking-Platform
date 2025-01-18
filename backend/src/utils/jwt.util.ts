import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";

export interface JwtPayload {
    userId: string;
    email: string;
    [key: string]: any; 
}

export const verifyToken = (token: string): JwtPayload => {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (typeof decoded === "object" && decoded !== null && "userId" in decoded) {
        return decoded as JwtPayload;
    }

    throw new Error("Invalid token payload");
};

export const generateToken = (payload: object): string => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
};

