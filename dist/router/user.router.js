"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const VerifyToken_1 = __importDefault(require("../middleware/VerifyToken"));
const router = express_1.default.Router();
router.post("/register", user_controller_1.registerUser);
router.post("/login", user_controller_1.loginUser);
router.get("/logout", user_controller_1.logoutUser);
router.put("/update", VerifyToken_1.default, user_controller_1.updateUser);
router.put("/forgot-password", user_controller_1.forgotPassword);
router.put("/verify-otp", user_controller_1.verifyForgotPasswordOtp);
router.put("/reset-password", user_controller_1.resetPassword);
exports.default = router;
