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
exports.getHomePageData = exports.getProductByCategoryAndSubCategory = exports.getProductByCategory = exports.getProductController = exports.searchProduct = exports.getProductDetails = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const subCategory_model_1 = __importDefault(require("../models/subCategory.model"));
const getProductDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({
                message: "Product slug is required",
                success: false,
                error: true
            });
        }
        const product = yield product_model_1.default.findOne({ slug })
            .select("-__v")
            .populate({
            path: "category subCategory",
            select: "name slug"
        })
            .lean();
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            });
        }
        return res.status(200).json({
            message: "Product details",
            productData: product,
            success: true,
            error: false
        });
    }
    catch (error) {
        console.error("Error in getProductDetails:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.getProductDetails = getProductDetails;
const searchProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { search = "", page = 1, limit = 50 } = req.query;
        page = Number(page);
        limit = Number(limit);
        if (isNaN(page) || page <= 0)
            page = 1;
        if (isNaN(limit) || limit <= 0 || limit > 50)
            limit = 50;
        const skip = (page - 1) * limit;
        const hasSearch = search.trim().length > 0;
        let query = {};
        if (hasSearch) {
            query = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ],
            };
        }
        const [data, totalCount] = yield Promise.all([
            product_model_1.default.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("name price image slug discount stock unit description")
                .lean(),
            product_model_1.default.countDocuments(query),
        ]);
        const formattedData = data.map((item) => {
            var _a;
            return ({
                _id: item._id,
                name: item.name,
                slug: item.slug,
                price: item.price,
                discount: item.discount,
                finalPrice: item.price - (item.price * (item.discount || 0)) / 100,
                image: ((_a = item.image) === null || _a === void 0 ? void 0 : _a[0]) || null,
                stock: item.stock,
                unit: item.unit,
                description: item.description,
            });
        });
        return res.status(200).json({
            message: hasSearch ? "Search results" : "All products",
            success: true,
            error: false,
            data: formattedData,
            totalCount,
            totalPage: Math.ceil(totalCount / limit),
            page,
            limit,
        });
    }
    catch (error) {
        console.error("Search Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true,
        });
    }
});
exports.searchProduct = searchProduct;
const getProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { page = 1, limit = 10, search } = req.query;
        page = Number(page);
        limit = Number(limit);
        if (isNaN(page) || page <= 0)
            page = 1;
        if (isNaN(limit) || limit <= 0 || limit > 50)
            limit = 10;
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.$text = { $search: search };
        }
        const [data, totalCount] = yield Promise.all([
            product_model_1.default.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("name price image slug category subCategory")
                .populate({
                path: "category subCategory",
                select: "name slug"
            })
                .lean(),
            product_model_1.default.countDocuments(query)
        ]);
        return res.status(200).json({
            message: "Product data",
            success: true,
            error: false,
            totalCount,
            totalNoPage: Math.ceil(totalCount / limit),
            page,
            limit,
            data
        });
    }
    catch (error) {
        console.error("Error in getProductController:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.getProductController = getProductController;
const getProductByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { slug, page = 1, limit = 15 } = req.query;
        if (!slug) {
            return res.status(400).json({
                message: "Provide category slug",
                error: true,
                success: false
            });
        }
        page = Number(page);
        limit = Number(limit);
        if (isNaN(page) || page <= 0)
            page = 1;
        if (isNaN(limit) || limit <= 0 || limit > 100)
            limit = 15;
        const skip = (page - 1) * limit;
        const category = yield category_model_1.default.findOne({ slug }).select("_id");
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }
        const [products, total] = yield Promise.all([
            product_model_1.default.find({ category: category._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("name price images slug")
                .lean(),
            product_model_1.default.countDocuments({ category: category._id })
        ]);
        return res.status(200).json({
            message: "Category product list",
            data: products,
            total,
            page,
            limit,
            success: true,
            error: false
        });
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.getProductByCategory = getProductByCategory;
const getProductByCategoryAndSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categorySlug, subCategorySlug } = req.params;
        if (!categorySlug || !subCategorySlug) {
            return res.status(400).json({
                message: "Provide categorySlug and subCategorySlug",
                error: true,
                success: false
            });
        }
        const category = yield category_model_1.default.findOne({ slug: categorySlug });
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }
        const subCategory = yield subCategory_model_1.default.findOne({
            slug: subCategorySlug,
            category: category._id
        });
        if (!subCategory) {
            return res.status(404).json({
                message: "SubCategory not found",
                error: true,
                success: false
            });
        }
        const query = {
            category: category._id,
            subCategory: subCategory._id
        };
        const [data, totalCount] = yield Promise.all([
            product_model_1.default.find(query)
                .select("name slug price discount image stock unit description")
                .sort({ createdAt: -1 })
                .lean(),
            product_model_1.default.countDocuments(query)
        ]);
        const formattedData = data.map((item) => {
            var _a;
            return ({
                _id: item._id,
                name: item.name,
                slug: item.slug,
                price: item.price,
                discount: item.discount,
                image: (_a = item.image) === null || _a === void 0 ? void 0 : _a[0],
                stock: item.stock,
                unit: item.unit,
                description: item.description
            });
        });
        return res.status(200).json({
            message: "Product list",
            data: formattedData,
            totalCount,
            success: true,
            error: false
        });
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.getProductByCategoryAndSubCategory = getProductByCategoryAndSubCategory;
const getHomePageData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const selectedCategories = [
            "Fruits & Vegetables",
            "Atta, Rice & Dal",
            "Dairy, Bread & Eggs",
            "Chicken, Meat & Fish",
            "Snacks & Munchies",
            "Cold Drinks & Juices"
        ];
        const data = yield product_model_1.default.aggregate([
            {
                $match: {
                    publish: true,
                    stock: { $gt: 0 }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryData"
                }
            },
            { $unwind: "$categoryData" },
            {
                $match: {
                    "categoryData.name": { $in: selectedCategories }
                }
            },
            {
                $group: {
                    _id: "$categoryData._id",
                    name: { $first: "$categoryData.name" },
                    slug: { $first: "$categoryData.slug" },
                    image: { $first: "$categoryData.image" },
                    products: {
                        $push: {
                            _id: "$_id",
                            name: "$name",
                            slug: "$slug",
                            description: "$description",
                            image: "$image",
                            price: "$price",
                            discount: "$discount",
                            unit: "$unit"
                        }
                    }
                }
            },
            {
                $addFields: {
                    products: { $slice: ["$products", 16] }
                }
            },
            {
                $addFields: {
                    sortOrder: {
                        $indexOfArray: [selectedCategories, "$name"]
                    }
                }
            },
            {
                $sort: { sortOrder: 1 }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    image: 1,
                    products: 1
                }
            }
        ]);
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error("Home API Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch homepage data"
        });
    }
});
exports.getHomePageData = getHomePageData;
