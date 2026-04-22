import { Request, Response } from "express";
import UserModel from "../models/user.model";
import SubCategoryModel from "../models/subCategory.model";
import mongoose from "mongoose";
import CategoryModel from "../models/category.model";

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


