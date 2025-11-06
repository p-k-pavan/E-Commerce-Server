"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const cartProductSchema = new mongoose_1.default.Schema({
    productId: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: 'product'
    },
    quantity: {
        type: Number,
        default: 1
    },
    userId: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});
const CartProductModel = mongoose_1.default.model('cartProduct', cartProductSchema);
exports.default = CartProductModel;
