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
exports.getCategoryWithSubCategories = exports.getCategory = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
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
const getCategoryWithSubCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield category_model_1.default.aggregate([
            {
                $lookup: {
                    from: "subcategories",
                    localField: "_id",
                    foreignField: "category",
                    as: "subCategories",
                },
            },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    subCategories: {
                        name: 1,
                        slug: 1,
                    },
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: true,
            message: error.message,
        });
    }
});
exports.getCategoryWithSubCategories = getCategoryWithSubCategories;
