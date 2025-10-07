import express from "express";
import { loginUser, logoutUser, registerUser, updateUser } from "../controllers/user.controller";
import VerifyToken from "../middleware/VerifyToken";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser)
router.get("/logout",logoutUser);
router.put("/update",VerifyToken,updateUser);


export default router;