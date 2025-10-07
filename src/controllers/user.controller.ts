import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { verifyEmail } from "../utils/verifyEmail";
import UserModel from "../models/user.model";

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

        const token = jwt.sign({ admin: true }, process.env.JWT_SECRET as string, {
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
        const token = jwt.sign({ admin: user.role === "ADMIN" }, process.env.JWT_SECRET as string, {
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