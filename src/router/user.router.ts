import express from "express";
import { forgotPassword, loginUser, logoutUser, registerUser, resetPassword, updateUser, verifyForgotPasswordOtp } from "../controllers/user.controller";
import VerifyToken from "../middleware/VerifyToken";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser)
router.get("/logout", logoutUser);
router.put("/update", VerifyToken, updateUser);
router.put("/forgot-password", forgotPassword);
router.put("/verify-otp", verifyForgotPasswordOtp);
router.put("/reset-password",resetPassword);


export default router;