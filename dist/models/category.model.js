"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const categorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/previews/048/215/948/original/icon-loading-illustration-free-vector.jpg"
    },
    slug: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true
    }
}, {
    timestamps: true
});
categorySchema.index({ slug: 1 });
categorySchema.pre("save", function (next) {
    if (this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
    }
    next();
});
const CategoryModel = mongoose_1.default.model('category', categorySchema);
exports.default = CategoryModel;
