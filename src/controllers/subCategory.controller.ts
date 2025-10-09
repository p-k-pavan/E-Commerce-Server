import { Request, Response } from "express";
import UserModel from "../models/user.model";
import SubCategoryModel from "../models/subCategory.model";

// Add SubCategory
export const addSubCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const { name, image, category } = req.body;

    if (!name || !image || !category?.[0]) {
      return res.status(400).json({
        message: "Enter required fields",
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

    res.status(500).json({ message: errorMessage, error: true, success: false });
  }
};

// Get SubCategory
export const getSubCategory = async (req: Request, res: Response) => {
  try {
    const data = await SubCategoryModel.find()
      .sort({ createdAt: -1 })
      .populate("category");

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

    res.status(500).json({ message: errorMessage, error: true, success: false });
  }
};

// Delete SubCategory
export const deleteSubCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Details Not Found",
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

    const deleteSub = await SubCategoryModel.findByIdAndDelete(id);

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

    res.status(500).json({ message: errorMessage, error: true, success: false });
  }
};

// Update SubCategory
export const updateSubCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const {name, image, category } = req.body;
    const {id} = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Details Not Found",
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

    const subCategory = await SubCategoryModel.findByIdAndUpdate(
      id,
      { name, image, category },
      { new: true }
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

    res.status(500).json({ message: errorMessage, error: true, success: false });
  }
};
