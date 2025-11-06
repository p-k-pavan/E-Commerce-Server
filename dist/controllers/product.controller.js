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
exports.getProductByCategoryAndSubCategory = exports.getProductByCategory = exports.getProductController = exports.searchProduct = exports.getProductDetails = exports.deleteProduct = exports.updateProductDetails = exports.addProduct = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
//add Product
const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({
                message: "Unauthorized",
                success: false,
                error: true
            });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User details not found",
                success: false,
                error: true
            });
        }
        if (user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }
        const { name, image, category, subCategory, unit, stock, price, discount, description, more_details, publish } = req.body;
        if (!name ||
            !(image === null || image === void 0 ? void 0 : image.length) ||
            !(category === null || category === void 0 ? void 0 : category.length) ||
            !(subCategory === null || subCategory === void 0 ? void 0 : subCategory.length) ||
            !unit ||
            !price ||
            !description) {
            return res.status(400).json({
                message: "All fields are required!",
                success: false,
                error: true
            });
        }
        const product = new product_model_1.default({
            name,
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
            sellerId: user._id
        });
        const saveProduct = yield product.save();
        return res.status(201).json({
            message: "Product created successfully",
            data: saveProduct,
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
            success: false,
            error: true
        });
    }
});
exports.addProduct = addProduct;
// Update Product Detail
const updateProductDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const productId = req.params.id;
        if (!userId) {
            return res.status(400).json({
                message: "Unauthorized",
                success: false,
                error: true
            });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User details not found",
                success: false,
                error: true
            });
        }
        if (user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
                success: false,
                error: true
            });
        }
        const product = yield product_model_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            });
        }
        const updateFields = [
            "name", "image", "category", "subCategory", "unit", "stock", "price", "discount", "description", "more_details", "publish"
        ];
        const productDoc = product;
        updateFields.forEach(field => {
            if (field in req.body) {
                productDoc[field] = req.body[field];
            }
        });
        const updatedProduct = yield product.save();
        return res.status(200).json({
            message: "Product updated successfully",
            data: updatedProduct,
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
            success: false,
            error: true
        });
    }
});
exports.updateProductDetails = updateProductDetails;
//delete products
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const productId = req.params.id;
        if (!userId) {
            return res.status(400).json({
                message: "Unauthorized",
                success: false,
                error: true
            });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User details not found",
                success: false,
                error: true
            });
        }
        if (user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
                success: false,
                error: true
            });
        }
        const product = yield product_model_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            });
        }
        yield product_model_1.default.findByIdAndDelete(productId);
        res.status(200).json({
            message: "Product deleted successfully",
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
            success: false,
            error: true
        });
    }
});
exports.deleteProduct = deleteProduct;
//get Product Details
const getProductDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({
                message: "Product details not found",
                success: false,
                error: true
            });
        }
        const product = yield product_model_1.default.findById(id);
        if (!product) {
            return res.status(404).json({
                message: "Product details not found",
                success: false,
                error: true
            });
        }
        res.status(200).json({
            message: "",
            productData: product,
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
            success: false,
            error: true
        });
    }
});
exports.getProductDetails = getProductDetails;
const searchProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { search = "", page = 1, limit = 10 } = req.body || {};
        // If 'search' has value -> search by text
        // Else -> show all products
        const query = search.trim()
            ? { $text: { $search: search } }
            : {};
        const skip = (page - 1) * limit;
        const [data, dataCount] = yield Promise.all([
            product_model_1.default.find(query)
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .populate("category subCategory"),
            product_model_1.default.countDocuments(query),
        ]);
        return res.json({
            message: search.trim() ? "Search results" : "All products",
            success: true,
            error: false,
            data,
            totalCount: dataCount,
            totalPage: Math.ceil(dataCount / limit),
            page,
            limit,
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true,
        });
    }
});
exports.searchProduct = searchProduct;
//get Product
const getProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { page, limit, search } = req.body;
        if (!page) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }
        const query = search ? {
            $text: {
                $search: search
            }
        } : {};
        const skip = (page - 1) * limit;
        const [data, totalCount] = yield Promise.all([
            product_model_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category subCategory'),
            product_model_1.default.countDocuments(query)
        ]);
        return res.json({
            message: "Product data",
            error: false,
            success: true,
            totalCount: totalCount,
            totalNoPage: Math.ceil(totalCount / limit),
            data: data
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        });
    }
});
exports.getProductController = getProductController;
const getProductByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({
                message: "provide category id",
                error: true,
                success: false
            });
        }
        const product = yield product_model_1.default.find({
            category: { $in: id }
        }).limit(15);
        return res.json({
            message: "category product list",
            data: product,
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
            success: false,
            error: true
        });
    }
});
exports.getProductByCategory = getProductByCategory;
const getProductByCategoryAndSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { categoryId, subCategoryId, page, limit } = req.body;
        if (!categoryId || !subCategoryId) {
            return res.status(400).json({
                message: "Provide categoryId and subCategoryId",
                error: true,
                success: false
            });
        }
        if (!page) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }
        const query = {
            category: { $in: categoryId },
            subCategory: { $in: subCategoryId }
        };
        const skip = (page - 1) * limit;
        const [data, dataCount] = yield Promise.all([
            product_model_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            product_model_1.default.countDocuments(query)
        ]);
        return res.json({
            message: "Product list",
            data: data,
            totalCount: dataCount,
            page: page,
            limit: limit,
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
            success: false,
            error: true
        });
    }
});
exports.getProductByCategoryAndSubCategory = getProductByCategoryAndSubCategory;
