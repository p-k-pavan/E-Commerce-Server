import { Request, Response } from "express";
import CategoryModel from "../models/category.model";
import UserModel from "../models/user.model";

// Get All Categories
export const getCategory = async (req: Request, res: Response) => {
  try {
    const data = await CategoryModel.find()
      .sort({ name: 1 })
      .select("name image slug")
      .lean();

    return res.json({
      data,
      success: true,
      error: false
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

export const getCategoryWithSubCategories = async (req: Request, res: Response) => {
  try {
    const data = await CategoryModel.aggregate([
      {
        $lookup: {
          from: "subcategories",
          localField: "_id",
          foreignField: "category",
          as: "subCategories",
        },
      },
      {
        $project: {
          name: 1,
          slug:1,
          subCategories: {
            name: 1,
            slug: 1,
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data,
    });

  } catch (error:any) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};