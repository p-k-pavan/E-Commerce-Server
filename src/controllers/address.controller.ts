import { Request, Response } from "express";
import Address from "../models/address.model";
import UserModel from "../models/user.model";

// add Address

export const addAddress = async (req: Request, res: Response) => {
    try {

        const userId = (req as Request & { userId?: string }).userId;

        if (!userId) {
            return res.status(400).json({
                message: "Unauthorize",
                error: true,
                success: false
            });
        }

        const { street, city, state, postalCode, country, mobile, isDefault } = req.body;

        if (!userId || !street || !city || !state || !postalCode || !country || !mobile) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (isDefault) {
            await Address.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } });
        }

        const newAddress = new Address({
            userId,
            street,
            city,
            state,
            postalCode,
            country,
            mobile,
            isDefault: !!isDefault
        });

        await newAddress.save();

        // Add address to user's address_details array
        await UserModel.findByIdAndUpdate(userId, { $push: { address_details: newAddress._id } });

        res.status(201).json({
            message: "Address added successfully",
            address: newAddress,
            error: false,
            success: true
        });

    } catch (error) {
         const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Server error";

        res.status(500).json({
            message: errorMessage,
            error: true,
            success: false,
        });
    }
};

// get all address
export const getAllAddress = async (req: Request, res: Response) => {
    try {

        const userId = (req as Request & { userId?: string }).userId;

        if (!userId) {
            return res.status(400).json({
                message: "Unauthorize",
                error: true,
                success: false
            });
        }

        const addresses = await Address.find({ userId: userId }).sort({ createdAt: -1 });

        if (addresses.length === 0) {
            return res.status(404).json({
                message: "No addresses found",
                error: true,
                success: false
            });
        }

        res.status(200).json({
            message: "Addresses fetched successfully",
            addresses,
            error: false,
            success: true
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error",
            error: true,
            success: false,
        });

    }
};

// delete address
export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;

        const addressId = req.params.id;

        if (!userId) {
            return res.status(400).json({
                message: "Unauthorize",
                error: true,
                success: false
            });
        }

        if (!addressId) {
            return res.status(400).json({ message: "Address id is required" });
        }

        const address = await Address.findOne({ _id: addressId, userId: userId });

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            });
        }

        await Address.findByIdAndDelete(addressId);

        // Remove address from user's address_details array
        await UserModel.findByIdAndUpdate(userId, { $pull: { address_details: addressId } });

        res.status(200).json({
            message: "Address deleted successfully",
            error: false,
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: true,
            success: false,
        });
    }
};

// update address
export const updateAddress = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;
        const addressId = req.params.id;
        console.log(userId);
        console.log(addressId)
        const { street, city, state, postalCode, country, mobile, isDefault } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "Unauthorize",
                error: true,
                success: false
            });
        }

        if (isDefault) {
            await Address.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } });
        }

        const updatedAddress = await Address.findOneAndUpdate(
            { _id: addressId, userId },
            { street, city, state, postalCode, country, mobile, isDefault: !isDefault },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({
                message: "Address not found 1",
                error: true,
                success: false
            });
        }

        res.status(200).json({
            message: "Address updated successfully",
            address: updateAddress,
            error: false,
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: true,
            success: false,
        });
    }
};