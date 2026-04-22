import { Request, Response } from "express";
import ProductModel from "../models/product.model";
import UserModel from "../models/user.model";
import CategoryModel from "../models/category.model";
import SubCategoryModel from "../models/subCategory.model";


export const getProductDetails = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                message: "Product slug is required",
                success: false,
                error: true
            });
        }

        const product = await ProductModel.findOne({ slug })
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

    } catch (error) {
        console.error("Error in getProductDetails:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

export const searchProduct = async (req: Request, res: Response) => {
    try {
        let { search = "", page = 1, limit = 50 } = req.query as {
            search?: string;
            page?: string;
            limit?: string;
        };

        page = Number(page);
        limit = Number(limit);

        if (isNaN(page) || page <= 0) page = 1;
        if (isNaN(limit) || limit <= 0 || limit > 50) limit = 50;

        const skip = (page - 1) * limit;

        const hasSearch = search.trim().length > 0;

        let query: any = {};

        if (hasSearch) {
            query = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ],
            };
        }

        const [data, totalCount] = await Promise.all([
            ProductModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("name price image slug discount stock unit description")
                .lean(),

            ProductModel.countDocuments(query),
        ]);

        const formattedData = data.map((item) => ({
            _id: item._id,
            name: item.name,
            slug: item.slug,
            price: item.price,
            discount: item.discount,
            finalPrice:
                item.price - (item.price * (item.discount || 0)) / 100,
            image: item.image?.[0] || null,
            stock: item.stock,
            unit: item.unit,
            description: item.description,
        }));

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

    } catch (error) {
        console.error("Search Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true,
        });
    }
};

export const getProductController = async (req: Request, res: Response) => {
    try {
        let { page = 1, limit = 10, search } = req.query as {
            page?: string;
            limit?: string;
            search?: string;
        };

        page = Number(page);
        limit = Number(limit);

        if (isNaN(page) || page <= 0) page = 1;
        if (isNaN(limit) || limit <= 0 || limit > 50) limit = 10;

        const skip = (page - 1) * limit;

        const query: any = {};

        if (search) {
            query.$text = { $search: search };
        }

        const [data, totalCount] = await Promise.all([
            ProductModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("name price image slug category subCategory")
                .populate({
                    path: "category subCategory",
                    select: "name slug"
                })
                .lean(),

            ProductModel.countDocuments(query)
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

    } catch (error) {
        console.error("Error in getProductController:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

export const getProductByCategory = async (req: Request, res: Response) => {
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

        if (isNaN(page) || page <= 0) page = 1;
        if (isNaN(limit) || limit <= 0 || limit > 100) limit = 15;

        const skip = (page - 1) * limit;

        const category = await CategoryModel.findOne({ slug }).select("_id");

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }

        const [products, total] = await Promise.all([
            ProductModel.find({ category: category._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("name price images slug")
                .lean(),

            ProductModel.countDocuments({ category: category._id })
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

    } catch (error) {
        console.error("Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

export const getProductByCategoryAndSubCategory = async (req: Request, res: Response) => {
    try {
        const { categorySlug, subCategorySlug } = req.params;

        if (!categorySlug || !subCategorySlug) {
            return res.status(400).json({
                message: "Provide categorySlug and subCategorySlug",
                error: true,
                success: false
            });
        }

        const category = await CategoryModel.findOne({ slug: categorySlug });
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }

        const subCategory = await SubCategoryModel.findOne({
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

        const [data, totalCount] = await Promise.all([
            ProductModel.find(query)
                .select("name slug price discount image stock unit description")
                .sort({ createdAt: -1 })
                .lean(),

            ProductModel.countDocuments(query)
        ]);

        const formattedData = data.map((item) => ({
            _id: item._id,
            name: item.name,
            slug: item.slug,
            price: item.price,
            discount: item.discount,
            image: item.image?.[0],
            stock: item.stock,
            unit: item.unit,
            description: item.description
        }));

        return res.status(200).json({
            message: "Product list",
            data: formattedData,
            totalCount,
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

export const getHomePageData = async (req: Request, res: Response) => {
    try {
        const selectedCategories = [
            "Fruits & Vegetables",
            "Atta, Rice & Dal",
            "Dairy, Bread & Eggs",
            "Chicken, Meat & Fish",
            "Snacks & Munchies",
            "Cold Drinks & Juices"
        ];

        const data = await ProductModel.aggregate([
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

    } catch (error) {
        console.error("Home API Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch homepage data"
        });
    }
};
