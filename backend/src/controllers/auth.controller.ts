import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { errorResponse, successResponse } from "../utils/response.util";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public async login(req: Request, res: Response): Promise<void> {
        const { identifier, password } = req.body;

        try {
            const token = await this.authService.login(identifier, password);

            res.cookie("token", token, { httpOnly: false, maxAge: 3600 * 1000 }); 
            res.status(200).json(successResponse("Login successfull", { token }));
        } catch (error: any) {
            res.status(401).json(errorResponse("Login failed", error.message));
        }
    }

    public async register(req: Request, res: Response): Promise<void> {
        const { username, name, email, password, confirmPassword } = req.body;

        try {
            if (password != confirmPassword) {
                throw new Error("Passwords do not match")
            }
            const user = await this.authService.register(username, name, email, password);

            const token = await this.authService.login(username, password);
            res.cookie("token", token, { httpOnly: false, maxAge: 3600 * 1000 });
            res.status(200).json(successResponse("Registration and login successful", { token }));
        } catch (error: any) {
            res.status(400).json(errorResponse("Registration failed", error.message));
        }
    }
}
