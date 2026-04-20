import { Request, Response } from "express";
import Order from "../models/order.model";
import User from "../models/user.model";
import Product from "../models/product.model";
import Category from "../models/category.model";

interface SalesData {
  date: string;
  revenue: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

export const getDashboardStats = async (
  req: Request,
  res: Response
) => {
  try {

 
    const revenueData = await Order.aggregate([
  {
    $match: {
      payment_status: { $in: ["PAID", "CASH ON DELIVERY"] }
    }
  },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$totalAmt" }
    }
  }
]);

    const totalRevenue: number = revenueData[0]?.totalRevenue || 0;

    const totalOrders: number = await Order.countDocuments();

    const totalCustomers: number = await User.countDocuments();

    const lowStock: number = await Product.countDocuments({
      stock: { $lt: 10 },
    });

    const rawSales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(
              new Date().setDate(new Date().getDate() - 30)
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%m-%d",
              date: "$createdAt",
            },
          },
          revenue: { $sum: "$totalAmt" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const salesData: SalesData[] = rawSales.map((item: any) => ({
      date: item._id,
      revenue: item.revenue,
    }));

    const rawCategory = await Product.aggregate([
  {
    $group: {
      _id: "$category",
      value: { $sum: 1 },
    },
  },
  {
    $sort: { value: -1 }, 
  },
  {
    $limit: 6,
  },
  {
    $lookup: {
      from: "categories",
      localField: "_id",
      foreignField: "_id",
      as: "category",
    },
  },
  { $unwind: "$category" },
  {
    $project: {
      name: "$category.name",
      value: 1,
    },
  },
]);

    const categoryData: CategoryData[] = rawCategory;

    const recentOrdersRaw = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name")
      .lean();

    const recentOrders: RecentOrder[] = recentOrdersRaw.map((order: any) => ({
      id: order.orderId,
      customer: order.userId?.name || "Unknown",
      amount: `₹${order.totalAmt}`,
      status: order.payment_status,
      date: new Date(order.createdAt).toDateString(),
      deliveryStatus: order.delivery_status
    }));

    res.status(200).json({
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        lowStock,
      },
      salesData,
      categoryData,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
    });
  }
};