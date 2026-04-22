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
exports.getCustomerStats = exports.getCustomers = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const getCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const customers = yield user_model_1.default.aggregate([
            {
                $match: {
                    role: "USER",
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "orderHistory",
                    foreignField: "_id",
                    as: "orders",
                },
            },
            {
                $addFields: {
                    totalSpent: { $sum: "$orders.totalAmt" },
                    ordersCount: { $size: "$orders" },
                },
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    mobile: 1,
                    totalSpent: 1,
                    ordersCount: 1,
                    createdAt: 1,
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);
        const formattedCustomers = customers.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.mobile || "N/A",
            orders: user.ordersCount || 0,
            spent: `₹${(user.totalSpent || 0).toLocaleString()}`,
        }));
        const total = yield user_model_1.default.countDocuments({
            role: "USER",
        });
        res.status(200).json({
            customers: formattedCustomers,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        res.status(500).json({
            message: "error fetching customers",
            success: false,
        });
    }
});
exports.getCustomers = getCustomers;
const getCustomerStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalCustomers = yield user_model_1.default.countDocuments({
            role: "USER",
        });
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const activeThisMonth = yield user_model_1.default.countDocuments({
            role: "USER",
            last_login_date: { $gte: startOfMonth },
        });
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAgo.setHours(0, 0, 0, 0);
        const newThisWeek = yield user_model_1.default.countDocuments({
            role: "USER",
            createdAt: { $gte: oneWeekAgo },
        });
        const response = {
            totalCustomers,
            activeThisMonth,
            newThisWeek,
        };
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({
            message: error.message || "Something went wrong",
        });
    }
});
exports.getCustomerStats = getCustomerStats;
