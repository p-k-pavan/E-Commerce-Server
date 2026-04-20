import express from "express";
const router = express.Router();
import VerifyToken from "../middleware/VerifyToken";
import {
 getDashboardStats
} from "../controllers/dashboard.controller";

router.get("/stats", VerifyToken,getDashboardStats);

export default router;