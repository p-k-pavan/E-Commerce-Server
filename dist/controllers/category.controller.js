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
exports.bulkUploadCategory = exports.getCategory = exports.deleteCategory = exports.updateCategory = exports.addCategory = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const subCategory_model_1 = __importDefault(require("../models/subCategory.model"));
// Add Category
const addCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name, image } = req.body;
        if (!name || !image) {
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
        const cleanName = name.trim();
        const existing = yield category_model_1.default.findOne({ name: cleanName });
        if (existing) {
            return res.status(400).json({
                message: "Category already exists",
                error: true,
                success: false
            });
        }
        const savedCategory = yield category_model_1.default.create({
            name: cleanName,
            image
        });
        return res.status(201).json({
            message: "Category saved successfully",
            data: savedCategory,
            success: true,
            error: false
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false
        });
    }
});
exports.addCategory = addCategory;
// Update Category
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name, image } = req.body;
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({
                message: "Slug is required",
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
        const updateData = {};
        if (name) {
            const cleanName = name.trim();
            updateData.name = cleanName;
            updateData.slug = cleanName
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, "");
        }
        if (image)
            updateData.image = image;
        const updatedCategory = yield category_model_1.default.findOneAndUpdate({ slug }, updateData, { new: true, runValidators: true });
        if (!updatedCategory) {
            return res.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }
        return res.json({
            message: "Category updated successfully",
            data: updatedCategory,
            success: true,
            error: false
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false
        });
    }
});
exports.updateCategory = updateCategory;
// Delete Category
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({
                message: "Slug is required",
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
        const category = yield category_model_1.default.findOne({ slug });
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }
        const checkSubCategory = yield subCategory_model_1.default.countDocuments({
            category: category._id
        });
        const checkProduct = yield product_model_1.default.countDocuments({
            category: category._id
        });
        if (checkSubCategory > 0 || checkProduct > 0) {
            return res.status(400).json({
                message: "Category is in use and cannot be deleted",
                error: true,
                success: false
            });
        }
        yield category_model_1.default.deleteOne({ slug });
        return res.json({
            message: "Category deleted successfully",
            success: true,
            error: false
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false
        });
    }
});
exports.deleteCategory = deleteCategory;
// Get All Categories
const getCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield category_model_1.default.find()
            .sort({ name: 1 })
            .select("name image slug")
            .lean();
        return res.json({
            data,
            success: true,
            error: false
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
exports.getCategory = getCategory;
const bulkUploadCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const categories = req.body;
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
        if (!Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({
                message: "Invalid data. Send array of categories",
                error: true,
                success: false
            });
        }
        const formattedData = categories.map((item) => {
            if (!item.name) {
                throw new Error("Category name is required");
            }
            const cleanName = item.name.trim();
            return {
                name: cleanName,
                image: item.image || undefined,
                slug: cleanName
                    .toLowerCase()
                    .replace(/ /g, "-")
                    .replace(/[^\w-]+/g, "")
            };
        });
        const result = yield category_model_1.default.insertMany(formattedData, {
            ordered: false
        });
        return res.status(201).json({
            message: "Bulk categories uploaded successfully",
            data: result,
            success: true,
            error: false
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || "Bulk upload failed",
            error: true,
            success: false
        });
    }
});
exports.bulkUploadCategory = bulkUploadCategory;
