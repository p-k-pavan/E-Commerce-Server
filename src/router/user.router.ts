import express from "express";
import { forgotPassword, loginUser, logoutUser, registerUser, updateUser } from "../controllers/user.controller";
import VerifyToken from "../middleware/VerifyToken";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser)
router.get("/logout",logoutUser);
router.put("/update",VerifyToken,updateUser);
router.put("/forgot-password",forgotPassword);


export default router;