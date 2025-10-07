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
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verifyEmailAddress = await verifyEmail(email);

        if (!verifyEmailAddress) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        const newUser = new UserModel({ name, email, password: hashedPassword });

        await newUser.save();

        const isProduction = process.env.NODE_ENV === "production";
        const age = 7 * 24 * 60 * 60; // 3 days in seconds

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET as string, {
            expiresIn: age,
        });

        res.cookie("ShopEase", token, {
            httpOnly: true,
            //secure: isProduction,
            //sameSite: isProduction ? "none" : "lax",
            maxAge: age * 1000,
        })
            .status(201)
            .json({
                message: "User registered successfully",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    token: token
                },
            });

    } catch (error) {

        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";

        res.status(500).json({ message: errorMessage || "Server error" });

    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isProduction = process.env.NODE_ENV === "production";
        const age = 7 * 24 * 60 * 60;
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: age,
        });
        res.cookie("ShopEase", token, {
            httpOnly: true,
            //secure: isProduction,
            //sameSite: isProduction ? "none" : "lax",
            maxAge: age * 1000,
        })
            .status(200)
            .json({
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: token
                },
            });
    } catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";
        res.status(500).json({ message: errorMessage || "Server error" });
    }
}

// User logout
export const logoutUser = (req: Request, res: Response) => {
    try {

        res.cookie("ShopEase", "", {
            httpOnly: true,
            //secure: process.env.NODE_ENV === "production",
            //sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            expires: new Date(0),
        }).status(200).json({ message: "Logout successful" });

    } catch (error) {

        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";
        res.status(500).json({ message: errorMessage || "Server error" });

    }
}

// Update user details
export const updateUser = async (req: Request, res: Response) => {
    try {

        const userId = (req as Request & { userId?: string }).userId;
        console.log(userId);
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        const { name, mobile, password } = req.body;

        let hashedPassword

        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            ...(name && { name: name }),
            ...(mobile && { mobile: mobile }),
            ...(password && { password: hashedPassword })
        }, { new: true });

        res.status(200).json({
            message: "User updated successfully",
            name: updatedUser?.name,
            email: updatedUser?.email,
            mobile: updatedUser?.mobile,
            role: updatedUser?.role,
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

// Forgot password

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {

        if (!email) {
            return res.status(400).json({ message: "Email is required",
                success: false,
                error: true
             });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found",
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
            "Password Reset OTP - ShopEase",
            verifyEmailTemplate({
                name: user.name,
                otp: otp.toString()
            })
        );

        res.status(200).json({ message: "OTP sent to email",
            success: true,
            error: false
        });

    } catch (error) {

        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";
        res.status(500).json({ message: errorMessage || "Server error" ,
            success: false,
            error: true
        });
    }
}

//verify forgot password otp

export const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    try {
        
        if(!email || !otp){
            return res.status(400).json({ message: "All fields are required",
                success: false,
                error: true
             });
        }

        const user = await UserModel.findOne({ email });

        if(!user){
            return res.status(400).json({ message: "User not found",
                success: false,
                error: true
             });
        }

        const currentTime = new Date();
        if(user.forgot_password_otp !== otp || !user.forgot_password_expiry || user.forgot_password_expiry < currentTime){
            return res.status(400).json({ message: "Invalid or expired OTP",
                success: false,
                error: true
             });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp : null,
            forgot_password_expiry : null
        },{ new : true });

        res.status(200).json({ message: "OTP verified successfully",
            success: true,
            error: false
        });

    } catch (error) {
        
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";
        res.status(500).json({ message: errorMessage || "Server error" ,
            success: false,
            error: true
        });

    }
}
