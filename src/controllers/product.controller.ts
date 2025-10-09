import { Request, Response } from "express";
import ProductModel from "../models/product.model";
import UserModel from "../models/user.model";

//add Product
export const addProduct = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;

        if (!userId) {
            return res.status(400).json({
                message: "Unauthorized",
                success: false,
                error: true
            });
        }

        const user = await UserModel.findById(userId);
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

        const {
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
            publish
        } = req.body;


        if (
            !name ||
            !image?.length ||
            !category?.length ||
            !subCategory?.length ||
            !unit ||
            !price ||
            !description
        ) {
            return res.status(400).json({
                message: "All fields are required!",
                success: false,
                error: true
            });
        }

        const product = new ProductModel({
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

        const saveProduct = await product.save();

        return res.status(201).json({
            message: "Product created successfully",
            data: saveProduct,
            error: false,
            success: true
        });

    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        });
    }
};

// Update Product Detail
export const updateProductDetails = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;
        const productId = req.params.id;

        if (!userId) {
            return res.status(400).json({
                message: "Unauthorized",
                success: false,
                error: true
            });
        }

        const user = await UserModel.findById(userId);
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

        const product = await ProductModel.findById(productId);
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
        const productDoc: any = product;
        updateFields.forEach(field => {
            if (field in req.body) {
                productDoc[field] = req.body[field];
            }
        });

        const updatedProduct = await product.save();

        return res.status(200).json({
            message: "Product updated successfully",
            data: updatedProduct,
            error: false,
            success: true
        });
    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        });
    }
}

//delete products
export const deleteProduct = async (req: Request, res: Response) => {
    try {

        const userId = (req as Request & { userId?: string }).userId;
        const productId = req.params.id;

        if (!userId) {
            return res.status(400).json({
                message: "Unauthorized",
                success: false,
                error: true
            });
        }

        const user = await UserModel.findById(userId);
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

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            });
        }

        await ProductModel.findByIdAndDelete(productId)

        res.status(200).json({
            message: "Product deleted successfully",
            success: true,
            error: false
        })


    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        });
    }
}

//get Product Details
export const getProductDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;


        if (!id) {
            return res.status(404).json({
                message: "Product details not found",
                success: false,
                error: true
            });
        }

        const product = await ProductModel.findById(id);

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
        })

    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        });
    }
}

//search Product
export const searchProduct = async (req: Request, res: Response) => {
    try {

        let { search, page, limit } = req.body;

        if (!page) {
            page = 1
        }

        if (!limit) {
            limit = 1
        }

        const query = search ? {
            $text: {
                $search: search
            }
        } : {}

        const skip = (page - 1) * limit

        const [data, dataCount] = await Promise.all([
            ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return res.json({
            message: "Product data",
            error: false,
            success: true,
            data: data,
            totalCount: dataCount,
            totalPage: Math.ceil(dataCount / limit),
            page: page,
            limit: limit
        })

    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        });
    }
}

//get Product
export const getProductController = async (req: Request, res: Response) => {
    try {

        let { page, limit, search } = req.body

        if (!page) {
            page = 1
        }

        if (!limit) {
            limit = 10
        }

        const query = search ? {
            $text: {
                $search: search
            }
        } : {}

        const skip = (page - 1) * limit

        const [data, totalCount] = await Promise.all([
            ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return res.json({
            message: "Product data",
            error: false,
            success: true,
            totalCount: totalCount,
            totalNoPage: Math.ceil(totalCount / limit),
            data: data
        })
    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        });
    }
}

export const getProductByCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.body

        if (!id) {
            return res.status(400).json({
                message: "provide category id",
                error: true,
                success: false
            })
        }

        const product = await ProductModel.find({
            category: { $in: id }
        }).limit(15)

        return res.json({
            message: "category product list",
            data: product,
            error: false,
            success: true
        })
    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        })
    }
}

export const getProductByCategoryAndSubCategory = async (req: Request, res: Response) => {
    try {
        let { categoryId, subCategoryId, page, limit } = req.body

        if (!categoryId || !subCategoryId) {
            return res.status(400).json({
                message: "Provide categoryId and subCategoryId",
                error: true,
                success: false
            })
        }

        if (!page) {
            page = 1
        }

        if (!limit) {
            limit = 10
        }

        const query = {
            category: { $in: categoryId },
            subCategory: { $in: subCategoryId }
        }

        const skip = (page - 1) * limit

        const [data, dataCount] = await Promise.all([
            ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            ProductModel.countDocuments(query)
        ])

        return res.json({
            message: "Product list",
            data: data,
            totalCount: dataCount,
            page: page,
            limit: limit,
            success: true,
            error: false
        })

    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        })
    }
}
