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
exports.getOrderStats = exports.deleteOrder = exports.updateOrderDetails = exports.getOrderDetails = exports.getOrders = void 0;
const order_model_1 = __importDefault(require("../../models/order.model"));
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req;
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
        const query = {};
        if (status !== "all") {
            query.delivery_status = status.toUpperCase();
        }
        if (search) {
            query.orderId = { $regex: search, $options: "i" };
        }
        const [orders, totalCount] = yield Promise.all([
            order_model_1.default.find(query)
                .populate("userId", "name email phone")
                .populate("delivery_address")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            order_model_1.default.countDocuments(query)
        ]);
        const formattedData = orders.map((order) => {
            var _a, _b, _c, _d, _e;
            return ({
                _id: order._id,
                id: order.orderId,
                date: order.createdAt,
                customer: ((_a = order.userId) === null || _a === void 0 ? void 0 : _a.name) || "Guest",
                phone: ((_b = order.userId) === null || _b === void 0 ? void 0 : _b.phone) || "",
                address: ((_c = order.delivery_address) === null || _c === void 0 ? void 0 : _c.address) || "",
                total: order.totalAmt,
                payment: (_d = order.payment_status) === null || _d === void 0 ? void 0 : _d.toLowerCase(),
                status: (_e = order.delivery_status) === null || _e === void 0 ? void 0 : _e.toLowerCase(),
                items: order.list_items.map((item) => {
                    var _a;
                    return ({
                        name: (_a = item.product_details) === null || _a === void 0 ? void 0 : _a.name,
                        qty: item.quantity,
                        price: item.total,
                    });
                }),
            });
        });
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
    }
    catch (error) {
        console.error("Get Orders Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.getOrders = getOrders;
// Get Single Order Details
const getOrderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required",
                success: false,
                error: true
            });
        }
        const order = yield order_model_1.default.findOne({ orderId })
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
    }
    catch (error) {
        console.error("Get Order Details Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.getOrderDetails = getOrderDetails;
// Update Order Details (Status & Reason)
const updateOrderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const user = req;
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
        const updateData = {};
        for (const key of allowedFields) {
            if (key in req.body) {
                updateData[key] = key === "delivery_status" ? req.body[key].toUpperCase() : req.body[key];
            }
        }
        // Logic for cancellation reason
        if (updateData.delivery_status === "CANCELLED" && !updateData.reson_for_cancellation) {
            updateData.reson_for_cancellation = "Cancelled by Admin";
        }
        const updatedOrder = yield order_model_1.default.findOneAndUpdate({ orderId }, { $set: updateData }, { new: true, runValidators: true }).lean();
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
    }
    catch (error) {
        console.error("Update Order Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.updateOrderDetails = updateOrderDetails;
// Delete Order
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const user = req;
        if (!user.userId || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }
        const deletedOrder = yield order_model_1.default.findOneAndDelete({ orderId });
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
    }
    catch (error) {
        console.error("Delete Order Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.deleteOrder = deleteOrder;
// Order Statistics (Dashboard)
const getOrderStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield order_model_1.default.aggregate([
            {
                $group: {
                    _id: "$delivery_status",
                    count: { $sum: 1 },
                },
            },
        ]);
        const result = {
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.getOrderStats = getOrderStats;
