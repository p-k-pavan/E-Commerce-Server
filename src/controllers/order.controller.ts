import { Request, Response } from "express";
import UserModel from "../models/user.model";
import mongoose from "mongoose";
import OrderModel from "../models/order.model";
import CartProductModel from "../models/cart.model";

export const cashonDelivery = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", error: true, success: false });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(403).json({ message: "Unauthorized access", error: true, success: false });
        }

        const { list_items, totalAmt, addressId, subTotalAmt } = req.body;

        if (!list_items || !totalAmt || !addressId || !subTotalAmt) {
            return res.status(400).json({
                message: "Something went wrong! Missing required fields.",
                error: true,
                success: false
            });
        }

        const payload = list_items.map((el: any) => ({
            userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,
            productId: el.productId?._id || el.productId,
            product_details: el.productId?.name ? {
                name: el.productId.name,
                image: el.productId.image
            } : undefined,
            payment_status: "CASH ON DELIVERY",
            delivery_address: addressId,
            subTotalAmt,
            totalAmt,
        }));

        const generatedOrders = await OrderModel.insertMany(payload);

        const orderIds = generatedOrders.map((order) => order._id);


        await UserModel.updateOne(
            { _id: userId },
            { $push: { orderHistory: { $each: orderIds } } }
        );

        await CartProductModel.deleteMany({ userId });
        await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });


        return res.status(201).json({
            message: "Order placed successfully",
            data: generatedOrders,
            success: true,
            error: false
        });

    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
};


export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", error: true, success: false });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(403).json({ message: "Unauthorized access", error: true, success: false });
        }

        const data = await OrderModel.find({ userId }).sort({ createdAt: -1 });
        return res.json({ data, success: true, error: false });

    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
};
