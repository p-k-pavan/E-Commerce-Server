"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: Array,
        default: [],
        required: true
    },
    category: [
        {
            type: mongoose_1.default.Schema.ObjectId,
            ref: 'category'
        }
    ],
    subCategory: [
        {
            type: mongoose_1.default.Schema.ObjectId,
            ref: 'subCategory'
        }
    ],
    unit: {
        type: String,
        default: "",
        required: true
    },
    stock: {
        type: Number,
        default: null,
    },
    size: {
        type: String,
        default: null
    },
    price: {
        type: Number,
        default: null,
        required: true
    },
    discount: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        default: "",
        required: true
    },
    more_details: {
        type: Object,
        default: {}
    },
    publish: {
        type: Boolean,
        default: true
    },
    sellerName: {
        type: String,
        required: true
    },
    sellerId: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});
productSchema.index({ name: "text", description: "text" });
const ProductModel = mongoose_1.default.model('product', productSchema);
exports.default = ProductModel;
