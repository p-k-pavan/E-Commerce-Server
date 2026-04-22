import { Request, Response } from "express";
import UserModel from "../../models/user.model";

interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: string;
}

export const getCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const search = (req.query.search as string) || "";
    const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const customers = await UserModel.aggregate([
      {
        $match: {
          role: "USER",
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderHistory",
          foreignField: "_id",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalSpent: { $sum: "$orders.totalAmt" },
          ordersCount: { $size: "$orders" },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          mobile: 1,
          totalSpent: 1,
          ordersCount: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const formattedCustomers: CustomerResponse[] = customers.map((user: any) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.mobile || "N/A",
      orders: user.ordersCount || 0,
      spent: `₹${(user.totalSpent || 0).toLocaleString()}`,
    }));

    const total = await UserModel.countDocuments({
      role: "USER",
    });

    res.status(200).json({
      customers: formattedCustomers,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({
      message: "error fetching customers",
      success: false,
    });
  }
};


interface CustomerStatsResponse {
  totalCustomers: number;
  activeThisMonth: number;
  newThisWeek: number;
}

export const getCustomerStats = async (
  req: Request,
  res: Response
) => {
  try {
    const totalCustomers = await UserModel.countDocuments({
      role: "USER",
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const activeThisMonth = await UserModel.countDocuments({
      role: "USER",
      last_login_date: { $gte: startOfMonth },
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const newThisWeek = await UserModel.countDocuments({
      role: "USER",
      createdAt: { $gte: oneWeekAgo },
    });

    const response: CustomerStatsResponse = {
      totalCustomers,
      activeThisMonth,
      newThisWeek,
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
};