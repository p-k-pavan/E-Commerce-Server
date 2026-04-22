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
exports.bulkUploadSubCategory = exports.deleteSubCategory = exports.getSubCategory = exports.updateSubCategory = exports.addSubCategory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const subCategory_model_1 = __importDefault(require("../../models/subCategory.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const saveImages_1 = require("../../utils/saveImages");
const addSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name, category } = req.body;
        const file = req.file;
        if (!name) {
            res.status(400).json({ message: "Name is required", error: true, success: false });
            return;
        }
        if (!category) {
            res.status(400).json({ message: "Category is required", error: true, success: false });
            return;
        }
        if (!file) {
            res.status(400).json({ message: "Image is required", error: true, success: false });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(category)) {
            res.status(400).json({ message: "Invalid category ID", error: true, success: false });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: "Unauthorized", error: true, success: false });
            return;
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user || user.role !== "ADMIN") {
            res.status(403).json({ message: "Unauthorized access", error: true, success: false });
            return;
        }
        const cleanName = name.trim();
        const [imageUrl] = yield (0, saveImages_1.uploadImagesToCloudinary)([file], {
            folder: "subcategories",
        });
        const slug = cleanName
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
        const saved = yield subCategory_model_1.default.create({
            name: cleanName,
            slug,
            image: imageUrl,
            category,
        });
        res.status(201).json({
            message: "Sub Category created successfully",
            data: saved,
            success: true,
            error: false,
        });
    }
    catch (error) {
        console.error("Add SubCategory Error:", error);
        res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false,
        });
    }
});
exports.addSubCategory = addSubCategory;
const updateSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name, category } = req.body;
        const { slug } = req.params;
        const file = req.file;
        if (!slug) {
            res.status(400).json({ message: "Slug is required", error: true, success: false });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: "Unauthorized", error: true, success: false });
            return;
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user || user.role !== "ADMIN") {
            res.status(403).json({ message: "Unauthorized access", error: true, success: false });
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
                folder: "subcategories",
            });
            updateData.image = imageUrl;
        }
        if (category) {
            if (!mongoose_1.default.Types.ObjectId.isValid(category)) {
                res.status(400).json({ message: "Invalid category id", error: true, success: false });
                return;
            }
            updateData.category = category;
        }
        const updated = yield subCategory_model_1.default.findOneAndUpdate({ slug }, updateData, { new: true, runValidators: true });
        if (!updated) {
            res.status(404).json({
                message: "Sub Category not found",
                error: true,
                success: false,
            });
            return;
        }
        res.json({
            message: "Sub Category updated successfully",
            data: updated,
            success: true,
            error: false,
        });
    }
    catch (error) {
        console.error("Update SubCategory Error:", error);
        res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false,
        });
    }
});
exports.updateSubCategory = updateSubCategory;
const getSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const data = yield subCategory_model_1.default.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "subCategory",
                    as: "products",
                },
            },
            {
                $addFields: {
                    productCount: { $size: "$products" },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    image: 1,
                    createdAt: 1,
                    productCount: 1,
                    category: {
                        name: 1,
                        _id: 1
                    },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);
        return res.json({
            message: "Sub Category data fetched successfully",
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
exports.getSubCategory = getSubCategory;
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
