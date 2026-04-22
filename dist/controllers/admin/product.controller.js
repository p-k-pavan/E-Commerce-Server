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
exports.bulkUploadProduct = exports.getProductController = exports.getProductDetails = exports.deleteProduct = exports.updateProductDetails = exports.addProduct = void 0;
const product_model_1 = __importDefault(require("../../models/product.model"));
const saveImages_1 = require("../../utils/saveImages");
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
        const files = req.files;
        const { name, category, subCategory, unit, stock = 0, price, discount = 0, description, more_details = {}, publish = true } = req.body;
        if (!name || !(files === null || files === void 0 ? void 0 : files.length) || !category || !subCategory || !unit || price === undefined || !description) {
            return res.status(400).json({
                message: "Missing required fields",
                success: false,
                error: true
            });
        }
        const imageUrls = yield (0, saveImages_1.uploadImagesToCloudinary)(files, {
            folder: "products",
        });
        let baseSlug = name.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-");
        let slug = baseSlug;
        let count = 0;
        while (yield product_model_1.default.findOne({ slug })) {
            count++;
            slug = `${baseSlug}-${count}`;
        }
        const product = yield product_model_1.default.create({
            name,
            slug,
            image: imageUrls,
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
            data: product,
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
        const files = req.files;
        const updateData = {};
        const allowedFields = [
            "name",
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
        if (files && files.length > 0) {
            const imageUrls = yield (0, saveImages_1.uploadImagesToCloudinary)(files, {
                folder: "products",
            });
            updateData.image = imageUrls;
        }
        const updatedProduct = yield product_model_1.default.findOneAndUpdate({ slug }, { $set: updateData }, { new: true, runValidators: true }).lean();
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
                .select("name price image slug category subCategory stock")
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
                category,
                subCategory,
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
