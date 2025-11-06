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
exports.updateSubCategory = exports.deleteSubCategory = exports.getSubCategoryByCategory = exports.getSubCategory = exports.addSubCategory = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const subCategory_model_1 = __importDefault(require("../models/subCategory.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// Add SubCategory
const addSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name, image, category } = req.body;
        if (!name || !image || !(category === null || category === void 0 ? void 0 : category[0])) {
            return res.status(400).json({
                message: "Enter required fields",
                error: true,
                success: false
            });
        }
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                error: true,
                success: false
            });
        }
        const saveSubCategory = yield subCategory_model_1.default.create({
            name,
            image,
            category
        });
        return res.status(201).json({
            message: "Sub Category created successfully",
            data: saveSubCategory,
            error: false,
            success: true
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.addSubCategory = addSubCategory;
// Get SubCategory
const getSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield subCategory_model_1.default.find()
            .sort({ createdAt: -1 })
            .populate("category");
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
        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.getSubCategory = getSubCategory;
// Get SubCategories by Category ID
const getSubCategoryByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.body;
        if (!categoryId) {
            return res.status(400).json({
                message: "Provide category id",
                error: true,
                success: false,
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                message: "Invalid category id",
                error: true,
                success: false,
            });
        }
        const subcategories = yield subCategory_model_1.default.find({
            category: { $in: [categoryId] },
        });
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
        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.getSubCategoryByCategory = getSubCategoryByCategory;
// Delete SubCategory
const deleteSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: "Details Not Found",
                error: true,
                success: false
            });
        }
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                error: true,
                success: false
            });
        }
        const deleteSub = yield subCategory_model_1.default.findByIdAndDelete(id);
        if (!deleteSub) {
            return res.status(404).json({
                message: "Sub Category not found",
                error: true,
                success: false
            });
        }
        return res.json({
            message: "Sub Category deleted successfully",
            data: deleteSub,
            error: false,
            success: true
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.deleteSubCategory = deleteSubCategory;
// Update SubCategory
const updateSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name, image, category } = req.body;
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: "Details Not Found",
                error: true,
                success: false
            });
        }
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                error: true,
                success: false
            });
        }
        const subCategory = yield subCategory_model_1.default.findByIdAndUpdate(id, { name, image, category }, { new: true });
        if (!subCategory) {
            return res.status(404).json({
                message: "Sub Category not found",
                error: true,
                success: false
            });
        }
        return res.json({
            message: "Sub Category updated successfully",
            data: subCategory,
            error: false,
            success: true
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.updateSubCategory = updateSubCategory;
