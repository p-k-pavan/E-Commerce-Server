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
exports.deleteCategory = exports.bulkUploadCategory = exports.getCategory = exports.updateCategory = exports.addCategory = void 0;
const category_model_1 = __importDefault(require("../../models/category.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const saveImages_1 = require("../../utils/saveImages");
const subCategory_model_1 = __importDefault(require("../../models/subCategory.model"));
const product_model_1 = __importDefault(require("../../models/product.model"));
const addCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name } = req.body;
        const file = req.file;
        if (!name) {
            res.status(400).json({
                message: "Category name is required",
                error: true,
                success: false,
            });
            return;
        }
        if (!file) {
            res.status(400).json({
                message: "Category image is required",
                error: true,
                success: false,
            });
            return;
        }
        if (!userId) {
            res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false,
            });
            return;
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user || user.role !== "ADMIN") {
            res.status(403).json({
                message: "Unauthorized access",
                error: true,
                success: false,
            });
            return;
        }
        const cleanName = name.trim();
        const existing = yield category_model_1.default.findOne({ name: cleanName });
        if (existing) {
            res.status(400).json({
                message: "Category already exists",
                error: true,
                success: false,
            });
            return;
        }
        const [imageUrl] = yield (0, saveImages_1.uploadImagesToCloudinary)([file], {
            folder: "categories",
        });
        const slug = cleanName
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
        const savedCategory = yield category_model_1.default.create({
            name: cleanName,
            slug,
            image: imageUrl,
        });
        res.status(201).json({
            message: "Category created successfully",
            data: savedCategory,
            success: true,
            error: false,
        });
    }
    catch (error) {
        console.error("Add Category Error:", error);
        res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false,
        });
    }
});
exports.addCategory = addCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name } = req.body;
        const { slug } = req.params;
        const file = req.file;
        if (!slug) {
            res.status(400).json({
                message: "Slug is required",
                error: true,
                success: false,
            });
            return;
        }
        if (!userId) {
            res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false,
            });
            return;
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user || user.role !== "ADMIN") {
            res.status(403).json({
                message: "Unauthorized access",
                error: true,
                success: false,
            });
            return;
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
        if (file) {
            const [imageUrl] = yield (0, saveImages_1.uploadImagesToCloudinary)([file], {
                folder: "categories",
            });
            updateData.image = imageUrl;
        }
        const updatedCategory = yield category_model_1.default.findOneAndUpdate({ slug }, updateData, { new: true, runValidators: true });
        if (!updatedCategory) {
            res.status(404).json({
                message: "Category not found",
                error: true,
                success: false,
            });
            return;
        }
        res.status(200).json({
            message: "Category updated successfully",
            data: updatedCategory,
            success: true,
            error: false,
        });
    }
    catch (error) {
        console.error("Update Category Error:", error);
        res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false,
        });
    }
});
exports.updateCategory = updateCategory;
const getCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield category_model_1.default.aggregate([
            {
                $lookup: {
                    from: "subcategories",
                    localField: "_id",
                    foreignField: "category",
                    as: "subcategories",
                },
            },
            {
                $addFields: {
                    subCategoryCount: { $size: "$subcategories" },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    slug: 1,
                    subCategoryCount: 1,
                },
            },
            {
                $sort: { name: 1 },
            },
        ]);
        return res.json({
            data,
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
