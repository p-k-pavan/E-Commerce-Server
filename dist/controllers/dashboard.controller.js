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
exports.getDashboardStats = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const revenueData = yield order_model_1.default.aggregate([
            {
                $match: {
                    payment_status: { $in: ["PAID", "CASH ON DELIVERY"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmt" }
                }
            }
        ]);
        const totalRevenue = ((_a = revenueData[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
        const totalOrders = yield order_model_1.default.countDocuments();
        const totalCustomers = yield user_model_1.default.countDocuments();
        const lowStock = yield product_model_1.default.countDocuments({
            stock: { $lt: 10 },
        });
        const rawSales = yield order_model_1.default.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%m-%d",
                            date: "$createdAt",
                        },
                    },
                    revenue: { $sum: "$totalAmt" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        const salesData = rawSales.map((item) => ({
            date: item._id,
            revenue: item.revenue,
        }));
        const rawCategory = yield product_model_1.default.aggregate([
            {
                $group: {
                    _id: "$category",
                    value: { $sum: 1 },
                },
            },
            {
                $sort: { value: -1 },
            },
            {
                $limit: 6,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            {
                $project: {
                    name: "$category.name",
                    value: 1,
                },
            },
        ]);
        const categoryData = rawCategory;
        const recentOrdersRaw = yield order_model_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("userId", "name")
            .lean();
        const recentOrders = recentOrdersRaw.map((order) => {
            var _a;
            return ({
                id: order.orderId,
                customer: ((_a = order.userId) === null || _a === void 0 ? void 0 : _a.name) || "Unknown",
                amount: `₹${order.totalAmt}`,
                status: order.payment_status,
                date: new Date(order.createdAt).toDateString(),
                deliveryStatus: order.delivery_status
            });
        });
        res.status(200).json({
            stats: {
                totalRevenue,
                totalOrders,
                totalCustomers,
                lowStock,
            },
            salesData,
            categoryData,
            recentOrders,
        });
    }
    catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({
            message: "Failed to fetch dashboard stats",
        });
    }
});
exports.getDashboardStats = getDashboardStats;
