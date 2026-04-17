import { Request, Response } from "express";
import UserModel from "../models/user.model";
import mongoose from "mongoose";
import OrderModel from "../models/order.model";
import CartProductModel from "../models/cart.model";
import Razorpay from "razorpay";
import crypto from "crypto";

export const cashonDelivery = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", error: true, success: false });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(403).json({ message: "Unauthorized access", error: true, success: false });
    }

    const { list_items, totalAmt, addressId, subTotalAmt } = req.body;

    if (!list_items || !totalAmt || !addressId || !subTotalAmt) {
      return res.status(400).json({
        message: "Missing required fields",
        error: true,
        success: false
      });
    }

    const order = await OrderModel.create({
      userId,
      orderId: `ORD-${new mongoose.Types.ObjectId()}`,

      list_items: list_items.map((el: any) => {
        const product = el.productId;
        const price = product.price;
        const discount = product.discount || 0;
        const qty = el.quantity;

        const discountedPrice = price - (price * discount) / 100;

        return {
          productId: product._id,
          product_details: {
            name: product.name,
            image: product.image[0],
            slug: product.slug,
          },
          quantity: qty,
          price: discountedPrice,
        };
      }),

      payment_status: "CASH ON DELIVERY",
      delivery_address: addressId,
      subTotalAmt,
      totalAmt,
    });

    await UserModel.updateOne(
      { _id: userId },
      { $push: { orderHistory: order._id } }
    );

    await CartProductModel.deleteMany({ userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    return res.status(201).json({
      message: "Order placed successfully",
      data: order,
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

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export const onlinePayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", error: true, success: false });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(403).json({ message: "Unauthorized access", error: true, success: false });
    }

    const { list_items, totalAmt, addressId, subTotalAmt } = req.body;

    if (!list_items || !totalAmt || !addressId || !subTotalAmt) {
      return res.status(400).json({
        message: "Missing required fields",
        error: true,
        success: false,
      });
    }

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(totalAmt * 100),
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    });

    return res.status(201).json({
      message: "Razorpay order created successfully",
      razorpayOrder,
      orderData: {
        list_items,
        totalAmt,
        addressId,
        subTotalAmt,
      },
      success: true,
      error: false,
    });

  } catch (error) {
    console.error("Online Payment Error:", error);

    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    const userId = (req as Request & { userId?: string }).userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", error: true, success: false });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
        error: true,
        success: false,
      });
    }

    const { list_items, totalAmt, addressId, subTotalAmt } = orderData;

    const order = await OrderModel.create({
      userId,
      orderId: `ORD-${new mongoose.Types.ObjectId()}`,

      list_items: list_items.map((el: any) => {
        const product = el.productId;
        const price = product.price;
        const discount = product.discount || 0;
        const qty = el.quantity;

        const discountedPrice = price - (price * discount) / 100;

        return {
          productId: product._id,
          product_details: {
            name: product.name,
            image: product.image[0],
            slug: product.slug,
          },
          quantity: qty,
          price: discountedPrice,
          total: discountedPrice * qty,
        };
      }),

      paymentId: razorpay_payment_id,
      payment_status: "PAID",
      delivery_address: addressId,
      subTotalAmt,
      totalAmt,
    });

    await UserModel.updateOne(
      { _id: userId },
      { $push: { orderHistory: order._id } }
    );

    await CartProductModel.deleteMany({ userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    return res.status(201).json({
      message: "Payment verified & order placed",
      data: order,
      success: true,
      error: false,
    });

  } catch (error) {
    console.error("Payment Verification Error:", error);

    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", error: true, success: false });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(403).json({ message: "Unauthorized access", error: true, success: false });
    }

    const orders = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate("delivery_address");

    const data = orders.map((order: any) => ({
      _id: order._id,
      orderId: order.orderId,

      items: order.list_items?.map((item: any) => ({
        name: item.product_details?.name,
        slug: item.product_details?.slug,
        image: item.product_details?.image,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),

      payment: {
        status: order.payment_status,
        paymentId: order.paymentId,
      },

      status: order.delivery_status,

      delivery_date: order.delivery_date,

      delivery: {
        address: order.delivery_address,
      },

      subTotal: order.subTotalAmt,
      total: order.totalAmt,

      createdAt: order.createdAt,
    }));

    return res.json({ data, success: true, error: false });

  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : "Server error";

    res.status(500).json({ message: errorMessage, error: true, success: false });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", error: true, success: false });
    }

    const order = await OrderModel.findOne({
      _id: id,
      userId,
    }).populate("delivery_address");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    const data = {
      _id: order._id,
      orderId: order.orderId,

      items: order.list_items?.map((item: any) => ({
        productId: item.productId,
        name: item.product_details?.name,
        slug: item.product_details?.slug,
        image: item.product_details?.image,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),

      payment: {
        status: order.payment_status,
        paymentId: order.paymentId,
      },

      status: order.delivery_status,

      delivery_date: order.delivery_date,

      delivery: {
        address: order.delivery_address,
      },

      subTotal: order.subTotalAmt,
      total: order.totalAmt,

      createdAt: order.createdAt,
    };

    return res.json({ data, success: true, error: false });

  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : "Server error";

    res.status(500).json({ message: errorMessage, error: true, success: false });
  }
};
