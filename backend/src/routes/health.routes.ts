import { Router } from "express";
import { successResponse } from "../utils/response.util";

const router = Router();
router.get("/health", (req, res) => {
    res.status(200).json(successResponse("Health check success", {}))
}
)

export default router;