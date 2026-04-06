"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const subCategorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    slug: {
        type: String,
        lowercase: true,
        trim: true
    },
    category: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: "category"
    }
}, {
    timestamps: true
});
subCategorySchema.index({ category: 1 });
subCategorySchema.index({ slug: 1 }, { unique: true });
subCategorySchema.pre("save", function (next) {
    if (this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
    }
    next();
});
const SubCategoryModel = mongoose_1.default.model('subCategory', subCategorySchema);
exports.default = SubCategoryModel;
