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
exports.getSubCategoryByCategorySlug = exports.getSubCategory = void 0;
const subCategory_model_1 = __importDefault(require("../models/subCategory.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
// Get SubCategory
const getSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const data = yield subCategory_model_1.default.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("category", "name image")
            .lean();
        return res.json({
            message: "Sub Category data fetched successfully",
            data,
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
            error: true,
            success: false
        });
    }
});
exports.getSubCategory = getSubCategory;
// Get SubCategories by Category ID
const getSubCategoryByCategorySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({
                message: "Provide category slug",
                error: true,
                success: false,
            });
        }
        const category = yield category_model_1.default.findOne({ slug });
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                error: true,
                success: false,
            });
        }
        const subcategories = yield subCategory_model_1.default.find({
            category: category._id,
        })
            .sort({ createdAt: -1 })
            .lean();
        return res.json({
            message: "Subcategories fetched successfully",
            data: subcategories,
            success: true,
            error: false,
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage,
            error: true,
            success: false,
        });
    }
});
exports.getSubCategoryByCategorySlug = getSubCategoryByCategorySlug;
