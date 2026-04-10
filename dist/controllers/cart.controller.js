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
exports.syncCartController = exports.deleteGuestCartController = exports.updateGuestCartQtyController = exports.getGuestCartController = exports.addToGuestCartController = exports.deleteCartItemQtyController = exports.updateCartItemQtyController = exports.getCartItemController = exports.addToCartItemController = void 0;
const cart_model_1 = __importDefault(require("../models/cart.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const addToCartItemController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { productId } = req.body;
        if (!productId) {
            return res.status(402).json({
                message: "Provide productId",
                error: true,
                success: false
            });
        }
        const checkItemCart = yield cart_model_1.default.findOne({
            userId: userId,
            productId: productId
        });
        if (checkItemCart) {
            return res.status(400).json({
                message: "Item already in cart"
            });
        }
        const cartItem = new cart_model_1.default({
            quantity: 1,
            userId: userId,
            productId: productId
        });
        const save = yield cartItem.save();
        const updateCartUser = yield user_model_1.default.updateOne({ _id: userId }, {
            $push: {
                shopping_cart: productId
            }
        });
        return res.json({
            data: save,
            message: "Item add successfully",
            error: false,
            success: true
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        });
    }
});
exports.addToCartItemController = addToCartItemController;
const getCartItemController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const cartItem = yield cart_model_1.default.find({
            userId: userId
        }).populate('productId');
        return res.json({
            cart: cartItem,
            error: false,
            success: true
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        });
    }
});
exports.getCartItemController = getCartItemController;
const updateCartItemQtyController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { _id, qty } = req.body;
        if (!_id || qty === undefined) {
            return res.status(400).json({
                message: "Provide _id and qty",
                error: true,
                success: false,
            });
        }
        const cartItem = yield cart_model_1.default.findOne({ _id, userId });
        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false,
            });
        }
        if (qty === 0) {
            yield cart_model_1.default.deleteOne({ _id, userId });
            yield user_model_1.default.updateOne({ _id: userId }, { $pull: { shopping_cart: cartItem.productId } });
            return res.json({
                message: "Item removed from cart (quantity was 0)",
                success: true,
                error: false,
            });
        }
        const updateCartItem = yield cart_model_1.default.updateOne({ _id, userId }, { quantity: qty });
        return res.json({
            message: "Cart item quantity updated",
            success: true,
            error: false,
            data: updateCartItem,
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true,
        });
    }
});
exports.updateCartItemQtyController = updateCartItemQtyController;
const deleteCartItemQtyController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { _id } = req.body;
        if (!_id) {
            return res.status(400).json({
                message: "Provide _id",
                error: true,
                success: false,
            });
        }
        // Find the cart item first to get the productId
        const cartItem = yield cart_model_1.default.findOne({ _id, userId });
        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false,
            });
        }
        // Delete from CartProductModel
        yield cart_model_1.default.deleteOne({ _id, userId });
        // Remove productId from UserModel.shopping_cart
        yield user_model_1.default.updateOne({ _id: userId }, { $pull: { shopping_cart: cartItem.productId } });
        return res.json({
            message: "Item removed successfully",
            error: false,
            success: true,
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true,
        });
    }
});
exports.deleteCartItemQtyController = deleteCartItemQtyController;
const addToGuestCartController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, guestId } = req.body;
        if (!productId || !guestId) {
            return res.status(400).json({
                message: "Provide productId and guestId",
                error: true,
                success: false,
            });
        }
        const checkItem = yield cart_model_1.default.findOne({
            guestId,
            productId,
        });
        if (checkItem) {
            return res.status(400).json({
                message: "Item already in cart",
            });
        }
        const cartItem = new cart_model_1.default({
            quantity: 1,
            guestId,
            productId,
        });
        const save = yield cartItem.save();
        return res.json({
            data: save,
            message: "Item added to guest cart",
            success: true,
            error: false,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Server error",
            success: false,
            error: true,
        });
    }
});
exports.addToGuestCartController = addToGuestCartController;
const getGuestCartController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { guestId } = req.query;
        const cart = yield cart_model_1.default.find({
            guestId,
        }).populate("productId");
        return res.json({
            cart,
            success: true,
            error: false,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Server error",
            success: false,
            error: true,
        });
    }
});
exports.getGuestCartController = getGuestCartController;
const updateGuestCartQtyController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, guestId, qty } = req.body;
        if (!_id || !guestId || qty === undefined) {
            return res.status(400).json({
                message: "Provide _id, guestId and qty",
                error: true,
                success: false,
            });
        }
        const cartItem = yield cart_model_1.default.findOne({
            _id,
            guestId,
        });
        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false,
            });
        }
        if (qty === 0) {
            yield cart_model_1.default.deleteOne({ _id, guestId });
            return res.json({
                message: "Item removed (qty = 0)",
                success: true,
                error: false,
            });
        }
        cartItem.quantity = qty;
        yield cartItem.save();
        return res.json({
            message: "Guest cart updated",
            success: true,
            error: false,
            data: cartItem,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Server error",
            success: false,
            error: true,
        });
    }
});
exports.updateGuestCartQtyController = updateGuestCartQtyController;
const deleteGuestCartController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, guestId } = req.body;
        if (!_id || !guestId) {
            return res.status(400).json({
                message: "Provide _id and guestId",
                error: true,
                success: false,
            });
        }
        yield cart_model_1.default.deleteOne({ _id, guestId });
        return res.json({
            message: "Item removed successfully",
            success: true,
            error: false,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Server error",
            success: false,
            error: true,
        });
    }
});
exports.deleteGuestCartController = deleteGuestCartController;
const syncCartController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { items } = req.body;
        if (!items || items.length === 0) {
            return res.json({
                message: "No items to sync",
                success: true,
            });
        }
        for (const item of items) {
            const existing = yield cart_model_1.default.findOne({
                userId,
                productId: item.productId,
            });
            if (existing) {
                existing.quantity += item.quantity;
                yield existing.save();
            }
            else {
                yield cart_model_1.default.create({
                    userId,
                    productId: item.productId,
                    quantity: item.quantity,
                });
            }
        }
        return res.json({
            message: "Cart synced successfully",
            success: true,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Sync failed",
            success: false,
        });
    }
});
exports.syncCartController = syncCartController;
