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
exports.getHomePageData = exports.bulkUploadProduct = exports.getProductByCategoryAndSubCategory = exports.getProductByCategory = exports.getProductController = exports.searchProduct = exports.getProductDetails = exports.deleteProduct = exports.updateProductDetails = exports.addProduct = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const subCategory_model_1 = __importDefault(require("../models/subCategory.model"));
//add Product
const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req;
        if (!user.userId || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }
        const { name, image, category, subCategory, unit, stock = 0, price, discount = 0, description, more_details = {}, publish = true } = req.body;
        if (!name ||
            !Array.isArray(image) || image.length === 0 ||
            !Array.isArray(category) || category.length === 0 ||
            !Array.isArray(subCategory) || subCategory.length === 0 ||
            !unit ||
            price === undefined ||
            !description) {
            return res.status(400).json({
                message: "Invalid or missing required fields",
                success: false,
                error: true
            });
        }
        if (price < 0 || discount < 0 || discount > 100 || stock < 0) {
            return res.status(400).json({
                message: "Invalid numeric values",
                success: false,
                error: true
            });
        }
        let baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, "")
            .replace(/\s+/g, "-");
        let slug = baseSlug;
        let count = 0;
        while (yield product_model_1.default.findOne({ slug })) {
            count++;
            slug = `${baseSlug}-${count}`;
        }
        const product = yield product_model_1.default.create({
            name,
            slug,
            image,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            publish,
            sellerName: user.name,
            sellerId: user.userId
        });
        return res.status(201).json({
            message: "Product created successfully",
            data: {
                _id: product._id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image
            },
            success: true,
            error: false
        });
    }
    catch (error) {
        console.error("Add Product Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.addProduct = addProduct;
// Update Product Detail
const updateProductDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const user = req;
        if (!user.userId || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }
        if (!slug) {
            return res.status(400).json({
                message: "Product slug is required",
                success: false,
                error: true
            });
        }
        const allowedFields = [
            "name",
            "image",
            "category",
            "subCategory",
            "unit",
            "stock",
            "price",
            "discount",
            "description",
            "more_details",
            "publish"
        ];
        const updateData = {};
        for (const key of allowedFields) {
            if (key in req.body) {
                updateData[key] = req.body[key];
            }
        }
        if (updateData.name) {
            updateData.slug = updateData.name
                .toLowerCase()
                .replace(/[^a-z0-9 ]/g, "")
                .replace(/\s+/g, "-");
        }
        const updatedProduct = yield product_model_1.default.findOneAndUpdate({ slug }, { $set: updateData }, {
            new: true,
            runValidators: true
        })
            .select("-__v")
            .lean();
        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            });
        }
        return res.status(200).json({
            message: "Product updated successfully",
            data: updatedProduct,
            success: true,
            error: false
        });
    }
    catch (error) {
        console.error("Update Product Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.updateProductDetails = updateProductDetails;
//delete products
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const user = req;
        if (!user.userId || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }
        if (!slug) {
            return res.status(400).json({
                message: "Product slug is required",
                success: false,
                error: true
            });
        }
        const deletedProduct = yield product_model_1.default.findOneAndDelete({ slug });
        if (!deletedProduct) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            });
        }
        return res.status(200).json({
            message: "Product deleted successfully",
            success: true,
            error: false
        });
    }
    catch (error) {
        console.error("Delete Product Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
});
exports.deleteProduct = deleteProduct;
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
        let { search = "", page = 1, limit = 10 } = req.query;
        page = Number(page);
        limit = Number(limit);
        if (isNaN(page) || page <= 0)
            page = 1;
        if (isNaN(limit) || limit <= 0 || limit > 50)
            limit = 10;
        const skip = (page - 1) * limit;
        const hasSearch = search.trim().length > 0;
        const query = hasSearch
            ? { $text: { $search: search } }
            : {};
        const [data, totalCount] = yield Promise.all([
            product_model_1.default.find(query)
                .sort(hasSearch ? { score: { $meta: "textScore" } } : { createdAt: -1 })
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
            message: hasSearch ? "Search results" : "All products",
            success: true,
            error: false,
            data,
            totalCount,
            totalPage: Math.ceil(totalCount / limit),
            page,
            limit
        });
    }
    catch (error) {
        console.error("Search Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
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
const bulkUploadProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req;
        if (!user.userId || user.role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }
        const { products } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, message: "Products array is required" });
        }
        const existingProducts = yield product_model_1.default.find({}, { slug: 1 });
        const slugSet = new Set(existingProducts.map(p => p.slug));
        const preparedProducts = products.map((item) => {
            const { name, image, category, subCategory, unit, stock, price, discount, description, more_details, publish } = item;
            const categoryIds = Array.isArray(category) ? category.map((c) => c._id || c) : [];
            const subCategoryIds = Array.isArray(subCategory) ? subCategory.map((s) => s._id || s) : [];
            let baseSlug = name
                .toLowerCase()
                .replace(/[^a-z0-9 ]/g, "")
                .replace(/\s+/g, "-");
            let slug = baseSlug;
            let count = 1;
            while (slugSet.has(slug)) {
                slug = `${baseSlug}-${count}`;
                count++;
            }
            slugSet.add(slug);
            return {
                name,
                slug,
                image,
                category: categoryIds,
                subCategory: subCategoryIds,
                unit,
                stock: stock || 0,
                price,
                discount: discount || 0,
                description,
                more_details: more_details || {},
                publish: publish !== undefined ? publish : true,
                sellerName: user.name,
                sellerId: user.userId
            };
        });
        const finalProducts = preparedProducts.filter(p => p.name && p.price !== undefined && p.category.length > 0);
        const insertedProducts = yield product_model_1.default.insertMany(finalProducts, {
            ordered: false
        });
        return res.status(201).json({
            success: true,
            insertedCount: insertedProducts.length,
            skippedCount: products.length - insertedProducts.length
        });
    }
    catch (error) {
        console.error("Bulk Upload Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
            error: true
        });
    }
});
exports.bulkUploadProduct = bulkUploadProduct;
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
