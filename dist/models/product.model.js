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
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    image: {
        type: [String],
        required: true,
        default: [],
    },
    // ✅ Use SINGLE ObjectId instead of array (IMPORTANT FIX)
    category: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: "category",
        required: true,
        index: true,
    },
    subCategory: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: "subCategory",
        required: true,
        index: true,
    },
    unit: {
        type: String,
        required: true,
        default: "",
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    size: {
        type: String,
        default: null,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        index: true,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    description: {
        type: String,
        required: true,
        default: "",
    },
    more_details: {
        type: Object,
        default: {},
    },
    publish: {
        type: Boolean,
        default: true,
        index: true,
    },
    sellerName: {
        type: String,
        required: true,
    },
    sellerId: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
productSchema.index({ name: "text", description: "text" });
productSchema.index({ createdAt: -1 });
productSchema.pre("validate", function (next) {
    if (this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, "")
            .replace(/\s+/g, "-");
    }
    next();
});
productSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("slug"))
            return next();
        let slug = this.slug;
        let count = 0;
        while (yield mongoose_1.default.models.product.findOne({ slug })) {
            count++;
            slug = `${this.slug}-${count}`;
        }
        this.slug = slug;
        next();
    });
});
const ProductModel = mongoose_1.default.model("product", productSchema);
exports.default = ProductModel;
