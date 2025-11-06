"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyForgotPasswordOtp = exports.forgotPassword = exports.updateUser = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyEmail_1 = require("../utils/verifyEmail");
const user_model_1 = __importDefault(require("../models/user.model"));
const generatedOTP_1 = __importDefault(require("../utils/generatedOTP"));
const sendMail_1 = __importDefault(require("../config/sendMail"));
const verifyEmailTemplate_1 = __importDefault(require("../utils/verifyEmailTemplate"));
// Register a new user
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                error: true,
                success: false
            });
        }
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
                error: true,
                success: false
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const verifyEmailAddress = yield (0, verifyEmail_1.verifyEmail)(email);
        if (!verifyEmailAddress) {
            return res.status(400).json({
                message: "Invalid email address",
                error: true,
                success: false
            });
        }
        const newUser = new user_model_1.default({ name, email, password: hashedPassword });
        yield newUser.save();
        const isProduction = process.env.NODE_ENV === "production";
        const age = 7 * 24 * 60 * 60; // 7 days in seconds
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: age,
        });
        res.cookie("NammaMart", token, {
            httpOnly: true,
            //secure: isProduction,
            //sameSite: isProduction ? "none" : "lax",
            maxAge: age * 1000,
        })
            .status(201)
            .json({
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                avatar: newUser.avatar || "",
                mobile: newUser.mobile || "",
                verify_email: newUser.verify_email || false,
                last_login_date: newUser.last_login_date || new Date().toISOString(),
                status: newUser.status || "active",
                address_details: newUser.address_details || [],
                orderHistory: newUser.orderHistory || [],
                shopping_cart: newUser.shopping_cart || [],
                token: token,
                error: false,
                success: true
            },
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            error: true,
            success: false
        });
    }
});
exports.registerUser = registerUser;
// User login
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                error: true,
                success: false
            });
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials",
                error: true,
                success: false
            });
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid credentials",
                error: true,
                success: false
            });
        }
        const isProduction = process.env.NODE_ENV === "production";
        const age = 7 * 24 * 60 * 60;
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: age,
        });
        res.cookie("NammaMart", token, {
            httpOnly: true,
            //secure: isProduction,
            //sameSite: isProduction ? "none" : "lax",
            maxAge: age * 1000,
        })
            .status(200)
            .json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || "",
                mobile: user.mobile || "",
                verify_email: user.verify_email || false,
                last_login_date: user.last_login_date || new Date().toISOString(),
                status: user.status || "active",
                address_details: user.address_details || [],
                orderHistory: user.orderHistory || [],
                shopping_cart: user.shopping_cart || [],
                token: token,
                error: false,
                success: true
            },
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            error: true,
            success: false
        });
    }
});
exports.loginUser = loginUser;
// User logout
const logoutUser = (req, res) => {
    try {
        res.cookie("NammaMart", "", {
            httpOnly: true,
            //secure: process.env.NODE_ENV === "production",
            //sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            expires: new Date(0),
        }).status(200).json({
            message: "Logout successful",
            error: false,
            success: true
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            error: true,
            success: false
        });
    }
};
exports.logoutUser = logoutUser;
// Update user details
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }
        const { name, mobile, avatar } = req.body;
        const update = {};
        if (typeof name === "string" && name.trim())
            update.name = name.trim();
        if (typeof mobile === "string" && mobile.trim())
            update.mobile = mobile.trim();
        if (typeof avatar === "string" && avatar.trim())
            update.avatar = avatar.trim();
        if (Object.keys(update).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided to update",
                error: true,
                success: false,
            });
        }
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, update, {
            new: true,
            runValidators: true,
        });
        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }
        res.status(200).json({
            message: "User updated successfully",
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar || "",
            mobile: updatedUser.mobile || "",
            verify_email: (_a = updatedUser.verify_email) !== null && _a !== void 0 ? _a : false,
            last_login_date: updatedUser.last_login_date || new Date().toISOString(),
            status: updatedUser.status || "active",
            address_details: updatedUser.address_details || [],
            orderHistory: updatedUser.orderHistory || [],
            shopping_cart: updatedUser.shopping_cart || [],
            error: false,
            success: true,
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            error: true,
            success: false
        });
    }
});
exports.updateUser = updateUser;
// Forgot password
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false,
                error: true
            });
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false,
                error: true
            });
        }
        const otp = (0, generatedOTP_1.default)();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(user._id, {
            forgot_password_otp: otp,
            forgot_password_expiry: otpExpiry
        }, { new: true });
        // Send OTP to user's email
        yield (0, sendMail_1.default)(email, "Password Reset OTP - NammaMart", (0, verifyEmailTemplate_1.default)({
            name: user.name,
            otp: otp.toString()
        }));
        res.status(200).json({
            message: "OTP sent to email",
            success: true,
            error: false
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            success: false,
            error: true
        });
    }
});
exports.forgotPassword = forgotPassword;
//verify forgot password otp
const verifyForgotPasswordOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        if (!email || !otp) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
                error: true
            });
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false,
                error: true
            });
        }
        const currentTime = new Date();
        if (user.forgot_password_otp !== otp || !user.forgot_password_expiry || user.forgot_password_expiry < currentTime) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
                success: false,
                error: true
            });
        }
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(user._id, {
            forgot_password_otp: null,
            forgot_password_expiry: null
        }, { new: true });
        res.status(200).json({
            message: "OTP verified successfully",
            success: true,
            error: false
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            success: false,
            error: true
        });
    }
});
exports.verifyForgotPasswordOtp = verifyForgotPasswordOtp;
//reset password
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword, confirmPassword } = req.body;
    try {
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
                error: true
            });
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false,
                error: true
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
                success: false,
                error: true
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(user._id, {
            password: hashedPassword
        }, { new: true });
        res.status(200).json({
            message: "Password reset successfully",
            success: true,
            error: false
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            success: false,
            error: true
        });
    }
});
exports.resetPassword = resetPassword;
