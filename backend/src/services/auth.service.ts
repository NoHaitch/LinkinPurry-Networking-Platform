import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/jwt.util";
import { isValidEmail } from "../utils/email.util";
import { DEFAULT_PROFILE } from "../config";

export class AuthService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async login(identifier: string, password: string): Promise<string> {
        let user = await this.prisma.users.findUnique({
            where: { email: identifier },
        });

        if (!user) {
            user = await this.prisma.users.findUnique({
                where: { username: identifier },
            });
        }

        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const token = generateToken({ userId: user.id.toString(), email: user.email });
        return token;
    }

    public async register(
        username: string,
        full_name: string,
        email: string,
        password: string
    ): Promise<object> {
        if (!isValidEmail(email)) {
            throw new Error("Invalid email format");
        }

        if (password.length < 6){
            throw new Error("Password should be at least 6 characters long")
        }
        const existingUserByEmail = await this.prisma.users.findFirst({
            where: { email },
        });
        
        if (existingUserByEmail) {
            throw new Error("Email already in use");
        }
        
        const existingUserByUsername = await this.prisma.users.findFirst({
            where: { username },
        });
        
        if (existingUserByUsername) {
            throw new Error("Username already in use");
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await this.prisma.users.create({
            data: {
                username,
                email,
                password_hash: hashedPassword,
                full_name,
                profile_photo_path: DEFAULT_PROFILE
            },
        });

        return {
            userId: newUser.id.toString(),
            username: newUser.username,
            email: newUser.email,
        };
    }
}
