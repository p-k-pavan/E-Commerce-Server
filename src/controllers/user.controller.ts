import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import e, { Request, Response } from "express";
import { verifyEmail } from "../utils/verifyEmail";
import UserModel from "../models/user.model";
import { error } from "console";
import generatedOtp from "../utils/generatedOTP";
import sendMail from "../config/sendMail";
import verifyEmailTemplate from "../utils/verifyEmailTemplate";


// Register a new user
export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                error: true,
                success: false
            });
        }

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
                error: true,
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verifyEmailAddress = await verifyEmail(email);

        if (!verifyEmailAddress) {
            return res.status(400).json({
                message: "Invalid email address",
                error: true,
                success: false
            });
        }

        const newUser = new UserModel({ name, email, password: hashedPassword });

        await newUser.save();

        const isProduction = process.env.NODE_ENV === "production";
        const age = 7 * 24 * 60 * 60; // 7 days in seconds

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET as string, {
            expiresIn: age,
        });

        res.cookie("NammaMart", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
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

    } catch (error) {

        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";

        res.status(500).json({
            message: errorMessage || "Server error",
            error: true,
            success: false
        });

    }
};

// User login
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                error: true,
                success: false
            });
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials",
                error: true,
                success: false
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
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
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: age,
        });
        res.cookie("NammaMart", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
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
    } catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            error: true,
            success: false
        });
    }
}

// User logout
export const logoutUser = (req: Request, res: Response) => {
    try {

        res.cookie("NammaMart", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            expires: new Date(0),
        }).status(200).json({
            message: "Logout successful",
            error: false,
            success: true
        });

    } catch (error) {

        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            error: true,
            success: false
        });

    }
}

// Update user details
export const updateUser = async (req: Request, res: Response) => {
    try {

        const userId = (req as Request & { userId?: string }).userId;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        const { name, mobile, avatar } = req.body as {
            name?: unknown;
            mobile?: unknown;
            avatar?: unknown;
        };

        const update: Record<string, unknown> = {};
        if (typeof name === "string" && name.trim()) update.name = name.trim();
        if (typeof mobile === "string" && mobile.trim()) update.mobile = mobile.trim();
        if (typeof avatar === "string" && avatar.trim()) update.avatar = avatar.trim();

        if (Object.keys(update).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided to update",
                error: true,
                success: false,
            });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(userId, update, {
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
            verify_email: updatedUser.verify_email ?? false,
            last_login_date:
                (updatedUser as any).last_login_date || new Date().toISOString(),
            status: updatedUser.status || "active",
            address_details: updatedUser.address_details || [],
            orderHistory: (updatedUser as any).orderHistory || [],
            shopping_cart: (updatedUser as any).shopping_cart || [],
            error: false,
            success: true,
        });

    } catch (error) {

        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            error: true,
            success: false
        });

    }
}

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false,
                error: true
            });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false,
                error: true
            });
        }

        const otp = generatedOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: otp,
            forgot_password_expiry: otpExpiry
        }, { new: true });

        // Send OTP to user's email
        await sendMail(
            email,
            "Password Reset OTP - NammaMart",
            verifyEmailTemplate({
                name: user.name,
                otp: otp.toString()
            })
        );

        res.status(200).json({
            message: "OTP sent to email",
            success: true,
            error: false
        });

    } catch (error) {

        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            success: false,
            error: true
        });
    }
}

//verify forgot password otp
export const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    try {

        if (!email || !otp) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
                error: true
            });
        }

        const user = await UserModel.findOne({ email });

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

        const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: null,
            forgot_password_expiry: null
        }, { new: true });

        res.status(200).json({
            message: "OTP verified successfully",
            success: true,
            error: false
        });

    } catch (error) {

        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            success: false,
            error: true
        });

    }
}

//reset password
export const resetPassword = async (req: Request, res: Response) => {
    const { email, newPassword, confirmPassword } = req.body;
    try {

        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
                error: true
            });
        }

        const user = await UserModel.findOne({ email });

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

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
            password: hashedPassword
        }, { new: true });

        res.status(200).json({
            message: "Password reset successfully",
            success: true,
            error: false
        });

    } catch (error) {

        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";
        res.status(500).json({
            message: errorMessage || "Server error",
            success: false,
            error: true
        });

    }
}
