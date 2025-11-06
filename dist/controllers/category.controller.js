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
exports.getCategory = exports.deleteCategory = exports.updateCategory = exports.addCategory = void 0;
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
        const savedCategory = yield category_model_1.default.create({ name, image });
        return res.status(201).json({
            message: "Category saved successfully",
            data: savedCategory,
            success: true,
            error: false
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.addCategory = addCategory;
// Update Category
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name, image } = req.body;
        const { id } = req.params;
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
        const category = yield category_model_1.default.findById(id);
        if (!category) {
            return res.status(404).json({
                message: "Category not found 1",
                error: true,
                success: false
            });
        }
        const updatedCategory = yield category_model_1.default.updateOne({ _id: id }, { name, image });
        return res.json({
            message: "Category updated successfully",
            data: updatedCategory,
            success: true,
            error: false
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.updateCategory = updateCategory;
// Delete Category
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", error: true, success: false });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({ message: "Unauthorized access", error: true, success: false });
        }
        const category = yield category_model_1.default.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found", error: true, success: false });
        }
        const checkSubCategory = yield subCategory_model_1.default.find({ category: { "$in": [id] } }).countDocuments();
        const checkProduct = yield product_model_1.default.find({ category: { "$in": [id] } }).countDocuments();
        if (checkSubCategory > 0 || checkProduct > 0) {
            return res.status(400).json({
                message: "Category is in use and cannot be deleted",
                error: true,
                success: false
            });
        }
        yield category_model_1.default.deleteOne({ _id: id });
        return res.json({
            message: "Category deleted successfully",
            success: true,
            error: false
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.deleteCategory = deleteCategory;
// Get All Categories
const getCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield category_model_1.default.find();
        return res.json({ data, success: true, error: false });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({ message: errorMessage, error: true, success: false });
    }
});
exports.getCategory = getCategory;
