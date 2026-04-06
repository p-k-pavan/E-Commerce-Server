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
exports.bulkUploadSubCategory = exports.updateSubCategory = exports.deleteSubCategory = exports.getSubCategoryByCategorySlug = exports.getSubCategory = exports.addSubCategory = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const subCategory_model_1 = __importDefault(require("../models/subCategory.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const category_model_1 = __importDefault(require("../models/category.model"));
// Add SubCategory
const addSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name, image, category } = req.body;
        if (!name || !image || !category) {
            return res.status(400).json({
                message: "Enter required fields",
                error: true,
                success: false
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                message: "Invalid category ID",
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
        res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
});
exports.addSubCategory = addSubCategory;
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
// Delete SubCategory
const deleteSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const deleteSub = yield subCategory_model_1.default.findOneAndDelete({ slug });
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
        res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
});
exports.deleteSubCategory = deleteSubCategory;
// Update SubCategory
const updateSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name, image, category } = req.body;
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
            updateData.name = name.trim();
            updateData.slug = name
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, "");
        }
        if (image)
            updateData.image = image;
        if (category) {
            if (!mongoose_1.default.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    message: "Invalid category id",
                    error: true,
                    success: false
                });
            }
            updateData.category = category;
        }
        const subCategory = yield subCategory_model_1.default.findOneAndUpdate({ slug }, updateData, { new: true, runValidators: true });
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
        res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
});
exports.updateSubCategory = updateSubCategory;
const bulkUploadSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const subCategories = req.body;
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
        if (!Array.isArray(subCategories) || subCategories.length === 0) {
            return res.status(400).json({
                message: "Invalid data. Send array of subcategories",
                error: true,
                success: false
            });
        }
        const formattedData = subCategories.map((item) => {
            if (!item.name || !item.category) {
                throw new Error("Name and category are required");
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(item.category)) {
                throw new Error(`Invalid category id for ${item.name}`);
            }
            return {
                name: item.name.trim(),
                image: item.image || "",
                category: item.category,
                slug: item.name
                    .toLowerCase()
                    .replace(/ /g, "-")
                    .replace(/[^\w-]+/g, "")
            };
        });
        const result = yield subCategory_model_1.default.insertMany(formattedData, {
            ordered: false
        });
        return res.status(201).json({
            message: "Bulk subcategories uploaded successfully",
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
exports.bulkUploadSubCategory = bulkUploadSubCategory;
