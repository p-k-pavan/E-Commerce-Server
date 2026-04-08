import { Request, Response } from "express";
import ProductModel from "../models/product.model";
import UserModel from "../models/user.model";
import CategoryModel from "../models/category.model";

//add Product
export const addProduct = async (req: Request, res: Response) => {
    try {
        const user = req as Request & { userId?: string; role?: string; name?: string };

        if (!user.userId || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }

        const {
            name,
            image,
            category,
            subCategory,
            unit,
            stock = 0,
            price,
            discount = 0,
            description,
            more_details = {},
            publish = true
        } = req.body;

        if (
            !name ||
            !Array.isArray(image) || image.length === 0 ||
            !Array.isArray(category) || category.length === 0 ||
            !Array.isArray(subCategory) || subCategory.length === 0 ||
            !unit ||
            price === undefined ||
            !description
        ) {
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

        while (await ProductModel.findOne({ slug })) {
            count++;
            slug = `${baseSlug}-${count}`;
        }

        const product = await ProductModel.create({
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

    } catch (error) {
        console.error("Add Product Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

// Update Product Detail
export const updateProductDetails = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const user = req as Request & { userId?: string; role?: string };

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

        const updateData: any = {};

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

        const updatedProduct = await ProductModel.findOneAndUpdate(
            { slug },
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        )
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

    } catch (error) {
        console.error("Update Product Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

//delete products
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const user = req as Request & { userId?: string; role?: string };

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

        const deletedProduct = await ProductModel.findOneAndDelete({ slug });

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

    } catch (error) {
        console.error("Delete Product Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

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
    let { search = "", page = 1, limit = 10 } = req.query as {
      search?: string;
      page?: string;
      limit?: string;
    };

    page = Number(page);
    limit = Number(limit);

    if (isNaN(page) || page <= 0) page = 1;
    if (isNaN(limit) || limit <= 0 || limit > 50) limit = 10;

    const skip = (page - 1) * limit;

    const hasSearch = search.trim().length > 0;

    const query: any = hasSearch
      ? { $text: { $search: search } }
      : {};

    const [data, totalCount] = await Promise.all([
      ProductModel.find(query)
        .sort(hasSearch ? { score: { $meta: "textScore" } } : { createdAt: -1 })
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
      message: hasSearch ? "Search results" : "All products",
      success: true,
      error: false,
      data,
      totalCount,
      totalPage: Math.ceil(totalCount / limit),
      page,
      limit
    });

  } catch (error) {
    console.error("Search Error:", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true
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
        let { categorySlug, subCategorySlug, page = 1, limit = 10 } = req.body;

        if (!categorySlug || !subCategorySlug) {
            return res.status(400).json({
                message: "Provide categorySlug and subCategorySlug",
                error: true,
                success: false
            });
        }

        page = Number(page);
        limit = Number(limit);

        if (isNaN(page) || page <= 0) page = 1;
        if (isNaN(limit) || limit <= 0 || limit > 100) limit = 10;

        const skip = (page - 1) * limit;

        const query = {
            "category.slug": categorySlug,
            "subCategory.slug": subCategorySlug
        };

        const [data, totalCount] = await Promise.all([
            ProductModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            ProductModel.countDocuments(query)
        ]);

        return res.status(200).json({
            message: "Product list",
            data,
            totalCount,
            page,
            limit,
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Error in getProductByCategoryAndSubCategory:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

export const bulkUploadProduct = async (req: Request, res: Response) => {
    try {
        const user = req as Request & { userId?: string; role?: string; name?: string };

        if (!user.userId || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
                error: true
            });
        }

        const products = req.body.products;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                message: "Products array is required",
                success: false,
                error: true
            });
        }

        if (products.length > 1000) {
            return res.status(400).json({
                message: "Max 1000 products allowed per upload",
                success: false,
                error: true
            });
        }

        const preparedProducts: any[] = [];

        for (const item of products) {
            const {
                name,
                image,
                category,
                subCategory,
                unit,
                stock = 0,
                price,
                discount = 0,
                description,
                more_details = {},
                publish = true
            } = item;

            if (
                !name ||
                !Array.isArray(image) ||
                image.length === 0 ||
                !Array.isArray(category) ||
                !Array.isArray(subCategory) ||
                !unit ||
                price === undefined ||
                !description
            ) {
                continue;
            }

            if (price < 0 || discount < 0 || discount > 100 || stock < 0) {
                continue;
            }

            // 🔥 Generate slug
            let baseSlug = name
                .toLowerCase()
                .replace(/[^a-z0-9 ]/g, "")
                .replace(/\s+/g, "-");

            let slug = baseSlug;
            let count = 0;

            while (await ProductModel.findOne({ slug })) {
                count++;
                slug = `${baseSlug}-${count}`;
            }

            preparedProducts.push({
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
        }

        const insertedProducts = await ProductModel.insertMany(preparedProducts, {
            ordered: false // skip duplicates, continue
        });

        return res.status(201).json({
            message: "Bulk upload completed",
            success: true,
            error: false,
            insertedCount: insertedProducts.length,
            skippedCount: products.length - insertedProducts.length
        });

    } catch (error) {
        console.error("Bulk Upload Error:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};
