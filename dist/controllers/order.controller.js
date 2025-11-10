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
exports.getOrderDetails = exports.verifyPayment = exports.onlinePayment = exports.cashonDelivery = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const order_model_1 = __importDefault(require("../models/order.model"));
const cart_model_1 = __importDefault(require("../models/cart.model"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const cashonDelivery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", error: true, success: false });
        }
        const user = yield user_model_1.default.findById(userId);
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
        const payload = list_items.map((el) => {
            const product = el.productId;
            const price = product.price;
            const discount = product.discount || 0;
            const qty = el.quantity;
            const discountedPrice = price - (price * discount) / 100;
            const itemTotal = discountedPrice * qty;
            return {
                userId,
                orderId: `ORD-${new mongoose_1.default.Types.ObjectId()}`,
                productId: product._id,
                product_details: {
                    name: product.name,
                    image: product.image
                },
                quantity: qty,
                payment_status: "CASH ON DELIVERY",
                delivery_address: addressId,
                subTotalAmt: price * qty,
                totalAmt: itemTotal,
            };
        });
        const generatedOrders = yield order_model_1.default.insertMany(payload);
        const orderIds = generatedOrders.map((order) => order._id);
        yield user_model_1.default.updateOne({ _id: userId }, { $push: { orderHistory: { $each: orderIds } } });
        yield cart_model_1.default.deleteMany({ userId });
        yield user_model_1.default.updateOne({ _id: userId }, { shopping_cart: [] });
        return res.status(201).json({
            message: "Order placed successfully",
            data: generatedOrders,
            success: true,
            error: false
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.cashonDelivery = cashonDelivery;
const razorpayInstance = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const onlinePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", error: true, success: false });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(403).json({ message: "Unauthorized access", error: true, success: false });
        }
        const { list_items, totalAmt, addressId, subTotalAmt } = req.body;
        if (!list_items || !totalAmt || !addressId || !subTotalAmt) {
            return res.status(400).json({
                message: "Something went wrong! Missing required fields.",
                error: true,
                success: false,
            });
        }
        const options = {
            amount: Math.round(totalAmt * 100),
            currency: "INR",
            receipt: crypto_1.default.randomBytes(10).toString("hex"),
        };
        const razorpayOrder = yield razorpayInstance.orders.create(options);
        if (!razorpayOrder) {
            return res.status(500).json({ message: "Failed to create Razorpay order", error: true });
        }
        return res.status(201).json({
            message: "Razorpay order created successfully",
            razorpayOrder: razorpayOrder,
            orderData: {
                list_items,
                totalAmt,
                addressId,
                subTotalAmt
            },
            success: true,
            error: false,
        });
    }
    catch (error) {
        console.error("Online Payment Error:", error);
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        return res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.onlinePayment = onlinePayment;
// Add payment verification
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", error: true, success: false });
        }
        const generated_signature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");
        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed", error: true, success: false });
        }
        const { list_items, totalAmt, addressId, subTotalAmt } = orderData;
        const payload = list_items.map((el) => {
            const product = el.productId;
            const price = product.price;
            const discount = product.discount || 0;
            const qty = el.quantity;
            const discountedPrice = price - (price * discount) / 100;
            const itemTotal = discountedPrice * qty;
            return {
                userId,
                orderId: `ORD-${new mongoose_1.default.Types.ObjectId()}`,
                paymentId: razorpay_order_id,
                productId: product._id,
                product_details: {
                    name: product.name,
                    image: product.image,
                },
                quantity: qty,
                payment_status: "PAID",
                delivery_address: addressId,
                subTotalAmt: price * qty,
                totalAmt: itemTotal,
            };
        });
        const generatedOrders = yield order_model_1.default.insertMany(payload);
        const orderIds = generatedOrders.map((order) => order._id);
        yield user_model_1.default.updateOne({ _id: userId }, { $push: { orderHistory: { $each: orderIds } } });
        yield cart_model_1.default.deleteMany({ userId });
        yield user_model_1.default.updateOne({ _id: userId }, { shopping_cart: [] });
        return res.status(201).json({
            message: "Payment verified and order placed successfully",
            data: generatedOrders,
            success: true,
            error: false,
        });
    }
    catch (error) {
        console.error("Payment Verification Error:", error);
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        return res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.verifyPayment = verifyPayment;
const getOrderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", error: true, success: false });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(403).json({ message: "Unauthorized access", error: true, success: false });
        }
        const data = yield order_model_1.default.find({ userId }).sort({ createdAt: -1 });
        return res.json({ data, success: true, error: false });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.getOrderDetails = getOrderDetails;
