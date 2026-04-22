import { Request, Response } from "express";
import mongoose from "mongoose";
import SubCategoryModel from "../../models/subCategory.model";
import UserModel from "../../models/user.model";
import { uploadImagesToCloudinary } from "../../utils/saveImages";

export const addSubCategory = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;
        const { name, category } = req.body;
        const file = req.file as Express.Multer.File | undefined;

        if (!name) {
            res.status(400).json({ message: "Name is required", error: true, success: false });
            return;
        }

        if (!category) {
            res.status(400).json({ message: "Category is required", error: true, success: false });
            return;
        }

        if (!file) {
            res.status(400).json({ message: "Image is required", error: true, success: false });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(category)) {
            res.status(400).json({ message: "Invalid category ID", error: true, success: false });
            return;
        }

        if (!userId) {
            res.status(401).json({ message: "Unauthorized", error: true, success: false });
            return;
        }

        const user = await UserModel.findById(userId);
        if (!user || user.role !== "ADMIN") {
            res.status(403).json({ message: "Unauthorized access", error: true, success: false });
            return;
        }

        const cleanName = name.trim();

        const [imageUrl] = await uploadImagesToCloudinary([file], {
            folder: "subcategories",
        });

        const slug = cleanName
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");

        const saved = await SubCategoryModel.create({
            name: cleanName,
            slug,
            image: imageUrl,
            category,
        });

        res.status(201).json({
            message: "Sub Category created successfully",
            data: saved,
            success: true,
            error: false,
        });

    } catch (error: any) {
        console.error("Add SubCategory Error:", error);

        res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false,
        });
    }
};

export const updateSubCategory = async (
    req: Request<{ slug: string }>,
    res: Response
) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;
        const { name, category } = req.body;
        const { slug } = req.params;
        const file = req.file as Express.Multer.File | undefined;

        if (!slug) {
            res.status(400).json({ message: "Slug is required", error: true, success: false });
            return;
        }

        if (!userId) {
            res.status(401).json({ message: "Unauthorized", error: true, success: false });
            return;
        }

        const user = await UserModel.findById(userId);
        if (!user || user.role !== "ADMIN") {
            res.status(403).json({ message: "Unauthorized access", error: true, success: false });
            return;
        }

        const updateData: {
            name?: string;
            slug?: string;
            image?: string;
            category?: string;
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
                folder: "subcategories",
            });

            updateData.image = imageUrl;
        }

        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                res.status(400).json({ message: "Invalid category id", error: true, success: false });
                return;
            }
            updateData.category = category;
        }

        const updated = await SubCategoryModel.findOneAndUpdate(
            { slug },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) {
            res.status(404).json({
                message: "Sub Category not found",
                error: true,
                success: false,
            });
            return;
        }

        res.json({
            message: "Sub Category updated successfully",
            data: updated,
            success: true,
            error: false,
        });

    } catch (error: any) {
        console.error("Update SubCategory Error:", error);

        res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false,
        });
    }
};

export const getSubCategory = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const data = await SubCategoryModel.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "subCategory",
                    as: "products",
                },
            },
            {
                $addFields: {
                    productCount: { $size: "$products" },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id:1,
                    name: 1,
                    slug: 1,
                    image: 1,
                    createdAt: 1,
                    productCount: 1,
                    category: {
                        name: 1,
                        _id: 1
                    },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        return res.json({
            message: "Sub Category data fetched successfully",
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

export const deleteSubCategory = async (req: Request, res: Response) => {
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

        const deleteSub = await SubCategoryModel.findOneAndDelete({ slug });

        if (!deleteSub) {
            return res.status(404).json({
                message: "Sub Category not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: "Sub Category deleted successfully",
            data: deleteSub,
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
            error: true,
            success: false
        });
    }
};

export const bulkUploadSubCategory = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;
        const subCategories = req.body;

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

        if (!Array.isArray(subCategories) || subCategories.length === 0) {
            return res.status(400).json({
                message: "Invalid data. Send array of subcategories",
                error: true,
                success: false
            });
        }

        const formattedData = subCategories.map((item) => {
            if (!item.name || !item.category) {
                throw new Error("Name and category are required");
            }

            if (!mongoose.Types.ObjectId.isValid(item.category)) {
                throw new Error(`Invalid category id for ${item.name}`);
            }

            return {
                name: item.name.trim(),
                image: item.image || "",
                category: item.category,
                slug: item.name
                    .toLowerCase()
                    .replace(/ /g, "-")
                    .replace(/[^\w-]+/g, "")
            };
        });

        const result = await SubCategoryModel.insertMany(formattedData, {
            ordered: false
        });

        return res.status(201).json({
            message: "Bulk subcategories uploaded successfully",
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