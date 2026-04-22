import { Request, Response } from "express";
import CategoryModel from "../../models/category.model";
import UserModel from "../../models/user.model";
import { uploadImagesToCloudinary } from "../../utils/saveImages";
import SubCategoryModel from "../../models/subCategory.model";
import ProductModel from "../../models/product.model";

export const addCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as Request & { userId?: string }).userId;
        const { name } = req.body;
        const file = req.file as Express.Multer.File | undefined;

        if (!name) {
            res.status(400).json({
                message: "Category name is required",
                error: true,
                success: false,
            });
            return;
        }

        if (!file) {
            res.status(400).json({
                message: "Category image is required",
                error: true,
                success: false,
            });
            return;
        }

        if (!userId) {
            res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false,
            });
            return;
        }
        const user = await UserModel.findById(userId);
        if (!user || user.role !== "ADMIN") {
            res.status(403).json({
                message: "Unauthorized access",
                error: true,
                success: false,
            });
            return;
        }

        const cleanName = name.trim();

        const existing = await CategoryModel.findOne({ name: cleanName });
        if (existing) {
            res.status(400).json({
                message: "Category already exists",
                error: true,
                success: false,
            });
            return;
        }

        const [imageUrl] = await uploadImagesToCloudinary([file], {
            folder: "categories",
        });

        const slug = cleanName
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");

        const savedCategory = await CategoryModel.create({
            name: cleanName,
            slug,
            image: imageUrl,
        });

        res.status(201).json({
            message: "Category created successfully",
            data: savedCategory,
            success: true,
            error: false,
        });

    } catch (error: any) {
        console.error("Add Category Error:", error);

        res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false,
        });
    }
};

export const updateCategory = async (
    req: Request<{ slug: string }>,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as Request & { userId?: string }).userId;
        const { name } = req.body;
        const { slug } = req.params;

        const file = req.file as Express.Multer.File | undefined;

        if (!slug) {
            res.status(400).json({
                message: "Slug is required",
                error: true,
                success: false,
            });
            return;
        }

        if (!userId) {
            res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false,
            });
            return;
        }

        const user = await UserModel.findById(userId);
        if (!user || user.role !== "ADMIN") {
            res.status(403).json({
                message: "Unauthorized access",
                error: true,
                success: false,
            });
            return;
        }

        const updateData: {
            name?: string;
            slug?: string;
            image?: string;
        } = {};

        if (name) {
            const cleanName = name.trim();

            updateData.name = cleanName;
            updateData.slug = cleanName
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, "");
        }

        if (file) {
            const [imageUrl] = await uploadImagesToCloudinary([file], {
                folder: "categories",
            });

            updateData.image = imageUrl;
        }

        const updatedCategory = await CategoryModel.findOneAndUpdate(
            { slug },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            res.status(404).json({
                message: "Category not found",
                error: true,
                success: false,
            });
            return;
        }

        res.status(200).json({
            message: "Category updated successfully",
            data: updatedCategory,
            success: true,
            error: false,
        });

    } catch (error: any) {
        console.error("Update Category Error:", error);

        res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false,
        });
    }
};

export const getCategory = async (req: Request, res: Response) => {
    try {
        const data = await CategoryModel.aggregate([
            {
                $lookup: {
                    from: "subcategories",
                    localField: "_id",
                    foreignField: "category",
                    as: "subcategories",
                },
            },
            {
                $addFields: {
                    subCategoryCount: { $size: "$subcategories" },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    slug: 1,
                    subCategoryCount: 1,
                },
            },
            {
                $sort: { name: 1 },
            },
        ]);

        return res.json({
            data,
            success: true,
            error: false,
        });

    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({
            message: errorMessage,
            error: true,
            success: false,
        });
    }
};

export const bulkUploadCategory = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;
        const categories = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findById(userId);
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                error: true,
                success: false
            });
        }

        if (!Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({
                message: "Invalid data. Send array of categories",
                error: true,
                success: false
            });
        }

        const formattedData = categories.map((item) => {
            if (!item.name) {
                throw new Error("Category name is required");
            }

            const cleanName = item.name.trim();

            return {
                name: cleanName,
                image: item.image || undefined,
                slug: cleanName
                    .toLowerCase()
                    .replace(/ /g, "-")
                    .replace(/[^\w-]+/g, "")
            };
        });

        const result = await CategoryModel.insertMany(formattedData, {
            ordered: false
        });

        return res.status(201).json({
            message: "Bulk categories uploaded successfully",
            data: result,
            success: true,
            error: false
        });

    } catch (error: any) {
        return res.status(500).json({
            message: error.message || "Bulk upload failed",
            error: true,
            success: false
        });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;
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

        const user = await UserModel.findById(userId);
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Unauthorized access",
                error: true,
                success: false
            });
        }

        const category = await CategoryModel.findOne({ slug });

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }

        const checkSubCategory = await SubCategoryModel.countDocuments({
            category: category._id
        });

        const checkProduct = await ProductModel.countDocuments({
            category: category._id
        });

        if (checkSubCategory > 0 || checkProduct > 0) {
            return res.status(400).json({
                message: "Category is in use and cannot be deleted",
                error: true,
                success: false
            });
        }

        await CategoryModel.deleteOne({ slug });

        return res.json({
            message: "Category deleted successfully",
            success: true,
            error: false
        });

    } catch (error: any) {
        return res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false
        });
    }
};