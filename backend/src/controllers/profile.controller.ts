import { NextFunction, Request, Response } from "express";
import { ProfileService } from "../services/profile.service";
import { errorResponse, successResponse } from "../utils/response.util";
import multer from "multer";
import { FileData} from "../utils/blob.util";
import { CompressorUtil } from "../utils/compress.util";

const storage = multer.memoryStorage(); 
const upload = multer({ storage });
export class ProfileController {
    private profileService: ProfileService;

    constructor() {
        this.profileService = new ProfileService();
    }

    public uploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
        upload.single("profile_photo")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json(
                        errorResponse("Too many files uploaded", "Please upload only one file for 'profile_photo'")
                    );
                }
                return res.status(400).json(errorResponse("File upload error", err.message));
            } else if (err) {
                return res.status(500).json(errorResponse("Internal server error", err.message));
            }
    
            if (req.files && Array.isArray(req.files)) {
                return res.status(400).json(
                    errorResponse("Too many files uploaded", "Please upload only one file for 'profile_photo'")
                );
            }
    
            next();
        });
    };

    public async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.params.userId); 
            const viewerId = req.body.user?.id || null; 
            const profile = await this.profileService.getProfile(userId, viewerId);
            res.locals.data = successResponse("Profile retrieved successfully", profile)
            res.status(200).json(successResponse("Profile retrieved successfully", profile));
        } catch (error: any) {
            res.status(404).json(errorResponse("Profile not found", error.message));
        }
    }

    public async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = BigInt(req.params.userId);
            const { name, work_history, skills, username } = req.body;

            let newProfilePhoto: FileData | undefined;
            if (req.file) {
                const compressedBuffer = await CompressorUtil.compressImage(
                    req.file.buffer,
                    "jpeg",
                    80,
                    800
                );

                newProfilePhoto = {
                    buffer: compressedBuffer,
                    fileName: req.file.originalname,
                    mimeType: req.file.mimetype,
                };
            }

            const updatedProfile = await this.profileService.updateProfile(userId, {
                fullName: name,
                workHistory: work_history,
                skills,
                username,
                newProfilePhoto,
            });

            res.status(200).json(successResponse("Profile updated successfully", updatedProfile));
        } catch (error: any) {
            res.status(400).json(errorResponse("Failed to update profile", error.message));
        }
    }

    
}
