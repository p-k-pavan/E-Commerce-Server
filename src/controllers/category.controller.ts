import { Request, Response } from "express";
import CategoryModel from "../models/category.model";
import UserModel from "../models/user.model";
import ProductModel from "../models/product.model";
import SubCategoryModel from "../models/subCategory.model";

// Add Category
export const addCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const { name, image } = req.body;

    if (!name || !image) {
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

    const savedCategory = await CategoryModel.create({ name, image });

    return res.status(201).json({
      message: "Category saved successfully",
      data: savedCategory,
      success: true,
      error: false
    });

  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : "Server error";

    res.status(500).json({ message: errorMessage, error: true, success: false });
  }
};

// Update Category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const { name, image} = req.body;
    const {id} = req.params;

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

    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found 1",
        error: true,
        success: false
      });
    }

    const updatedCategory = await CategoryModel.updateOne({ _id: id }, { name, image });

    return res.json({
      message: "Category updated successfully",
      data: updatedCategory,
      success: true,
      error: false
    });
  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : "Server error";

    res.status(500).json({ message: errorMessage, error: true, success: false });
  }
};

// Delete Category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", error: true, success: false });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access", error: true, success: false });
    }

    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found", error: true, success: false });
    }

    const checkSubCategory = await SubCategoryModel.find({ category: { "$in": [id] } }).countDocuments();
    const checkProduct = await ProductModel.find({ category: { "$in": [id] } }).countDocuments();

    if (checkSubCategory > 0 || checkProduct > 0) {
      return res.status(400).json({
        message: "Category is in use and cannot be deleted",
        error: true,
        success: false
      });
    }

    await CategoryModel.deleteOne({ _id: id });

    return res.json({
      message: "Category deleted successfully",
      success: true,
      error: false
    });
  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : "Server error";

    res.status(500).json({ message: errorMessage, error: true, success: false });
  }
};

// Get All Categories
export const getCategory = async (req: Request, res: Response) => {
  try {
    const data = await CategoryModel.find().sort({ name: 1 });
    return res.json({ data, success: true, error: false });
  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : "Server error";

    res.status(500).json({ message: errorMessage, error: true, success: false });
  }
};
