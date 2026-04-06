import { Request, Response } from "express";
import UserModel from "../models/user.model";
import SubCategoryModel from "../models/subCategory.model";
import mongoose from "mongoose";
import CategoryModel from "../models/category.model";

// Add SubCategory

export const addSubCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const { name, image, category } = req.body;

    if (!name || !image || !category) {
      return res.status(400).json({
        message: "Enter required fields",
        error: true,
        success: false
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        message: "Invalid category ID",
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

    const saveSubCategory = await SubCategoryModel.create({
      name,
      image,
      category
    });

    return res.status(201).json({
      message: "Sub Category created successfully",
      data: saveSubCategory,
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

// Get SubCategory
export const getSubCategory = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const data = await SubCategoryModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name image")
      .lean();

    return res.json({
      message: "Sub Category data fetched successfully",
      data,
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

// Get SubCategories by Category ID
export const getSubCategoryByCategorySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        message: "Provide category slug",
        error: true,
        success: false,
      });
    }

    const category = await CategoryModel.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }


    const subcategories = await SubCategoryModel.find({
      category: category._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      message: "Subcategories fetched successfully",
      data: subcategories,
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


// Delete SubCategory
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

// Update SubCategory
export const updateSubCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const { name, image, category } = req.body;
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

    const updateData: any = {};

    if (name) {
      updateData.name = name.trim();
      updateData.slug = name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    if (image) updateData.image = image;

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          message: "Invalid category id",
          error: true,
          success: false
        });
      }
      updateData.category = category;
    }

    const subCategory = await SubCategoryModel.findOneAndUpdate(
      { slug },
      updateData,
      { new: true, runValidators: true }
    );

    if (!subCategory) {
      return res.status(404).json({
        message: "Sub Category not found",
        error: true,
        success: false
      });
    }

    return res.json({
      message: "Sub Category updated successfully",
      data: subCategory,
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
