import { Request, Response } from "express";
import OrderModel from "../../models/order.model";

export const getOrders = async (req: Request, res: Response) => {
    try {
        const user = req as Request & { userId?: string; role?: string };

        if (!user.userId || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }

        let { page = 1, limit = 10, search = "", status = "all" } = req.query;

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        const query: any = {};

        if (status !== "all") {
            query.delivery_status = (status as string).toUpperCase();
        }

        if (search) {
            query.orderId = { $regex: search, $options: "i" };
        }

        const [orders, totalCount] = await Promise.all([
            OrderModel.find(query)
                .populate("userId", "name email phone")
                .populate("delivery_address")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            OrderModel.countDocuments(query)
        ]);

        const formattedData = orders.map((order: any) => ({
            _id: order._id,
            id: order.orderId,
            date: order.createdAt,
            customer: order.userId?.name || "Guest",
            phone: order.userId?.phone || "",
            address: order.delivery_address?.address || "",
            total: order.totalAmt,
            payment: order.payment_status?.toLowerCase(),
            status: order.delivery_status?.toLowerCase(),
            items: order.list_items.map((item: any) => ({
                name: item.product_details?.name,
                qty: item.quantity,
                price: item.total,
            })),
        }));

        return res.status(200).json({
            message: "Orders fetched successfully",
            success: true,
            error: false,
            data: formattedData,
            totalCount,
            totalNoPage: Math.ceil(totalCount / limitNum),
            page: pageNum,
            limit: limitNum
        });

    } catch (error) {
        console.error("Get Orders Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

// Get Single Order Details
export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required",
                success: false,
                error: true
            });
        }

        const order = await OrderModel.findOne({ orderId })
            .populate("userId", "name email phone")
            .populate("delivery_address")
            .lean();

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                success: false,
                error: true
            });
        }

        return res.status(200).json({
            message: "Order details",
            data: order,
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Get Order Details Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

// Update Order Details (Status & Reason)
export const updateOrderDetails = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const user = req as Request & { userId?: string; role?: string };

        if (!user.userId || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }

        const allowedFields = [
            "delivery_status",
            "payment_status",
            "reson_for_cancellation",
            "delivery_date"
        ];

        const updateData: any = {};
        for (const key of allowedFields) {
            if (key in req.body) {
                updateData[key] = key === "delivery_status" ? req.body[key].toUpperCase() : req.body[key];
            }
        }

        // Logic for cancellation reason
        if (updateData.delivery_status === "CANCELLED" && !updateData.reson_for_cancellation) {
            updateData.reson_for_cancellation = "Cancelled by Admin";
        }

        const updatedOrder = await OrderModel.findOneAndUpdate(
            { orderId },
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found",
                success: false,
                error: true
            });
        }

        return res.status(200).json({
            message: "Order updated successfully",
            data: updatedOrder,
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Update Order Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

// Delete Order
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const user = req as Request & { userId?: string; role?: string };

        if (!user.userId || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }

        const deletedOrder = await OrderModel.findOneAndDelete({ orderId });

        if (!deletedOrder) {
            return res.status(404).json({
                message: "Order not found",
                success: false,
                error: true
            });
        }

        return res.status(200).json({
            message: "Order deleted successfully",
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Delete Order Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

// Order Statistics (Dashboard)
export const getOrderStats = async (req: Request, res: Response) => {
    try {
        const stats = await OrderModel.aggregate([
            {
                $group: {
                    _id: "$delivery_status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const result: any = {
            all: 0,
            pending: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
        };

        stats.forEach((item) => {
            if (item._id) {
                const key = item._id.toLowerCase();
                if (key in result) {
                    result[key] = item.count;
                }
                result.all += item.count;
            }
        });

        return res.status(200).json({
            message: "Order statistics",
            success: true,
            error: false,
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};