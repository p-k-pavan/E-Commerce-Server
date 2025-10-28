import { Request, Response } from "express";
import CartProductModel from "../models/cart.model";
import UserModel from "../models/user.model";


export const addToCartItemController = async(req: Request, res: Response)=>{
    try {
        const  userId = req.userId
        const { productId } = req.body
        
        if(!productId){
            return res.status(402).json({
                message : "Provide productId",
                error : true,
                success : false
            })
        }

        const checkItemCart = await CartProductModel.findOne({
            userId : userId,
            productId : productId
        })

        if(checkItemCart){
            return res.status(400).json({
                message : "Item already in cart"
            })
        }

        const cartItem = new CartProductModel({
            quantity : 1,
            userId : userId,
            productId : productId
        })
        const save = await cartItem.save()

        const updateCartUser = await UserModel.updateOne({ _id : userId},{
            $push : { 
                shopping_cart : productId
            }
        })

        return res.json({
            data : save,
            message : "Item add successfully",
            error : false,
            success : true
        })

        
    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        });
    }
}

export const getCartItemController = async(req: Request, res: Response)=>{
    try {
        const userId = req.userId

        const cartItem =  await CartProductModel.find({
            userId : userId
        }).populate('productId')

        return res.json({
            cart : cartItem,
            error : false,
            success : true
        })

    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : "Server error";

        res.status(500).json({
            message: errorMessage,
            success: false,
            error: true
        });
    }
}

export const updateCartItemQtyController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { _id, qty } = req.body;

    if (!_id || qty === undefined) {
      return res.status(400).json({
        message: "Provide _id and qty",
        error: true,
        success: false,
      });
    }

    const cartItem = await CartProductModel.findOne({ _id, userId });
    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
        error: true,
        success: false,
      });
    }

    if (qty === 0) {
      await CartProductModel.deleteOne({ _id, userId });

      await UserModel.updateOne(
        { _id: userId },
        { $pull: { shopping_cart: cartItem.productId } }
      );

      return res.json({
        message: "Item removed from cart (quantity was 0)",
        success: true,
        error: false,
      });
    }

    const updateCartItem = await CartProductModel.updateOne(
      { _id, userId },
      { quantity: qty }
    );

    return res.json({
      message: "Cart item quantity updated",
      success: true,
      error: false,
      data: updateCartItem,
    });

  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : "Server error";

    res.status(500).json({
      message: errorMessage,
      success: false,
      error: true,
    });
  }
};


export const deleteCartItemQtyController = async(req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({
        message: "Provide _id",
        error: true,
        success: false,
      });
    }

    // Find the cart item first to get the productId
    const cartItem = await CartProductModel.findOne({ _id, userId });
    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
        error: true,
        success: false,
      });
    }

    // Delete from CartProductModel
    await CartProductModel.deleteOne({ _id, userId });

    // Remove productId from UserModel.shopping_cart
    await UserModel.updateOne(
      { _id: userId },
      { $pull: { shopping_cart: cartItem.productId } }
    );

    return res.json({
      message: "Item removed successfully",
      error: false,
      success: true,
    });

  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : "Server error";

    res.status(500).json({
      message: errorMessage,
      success: false,
      error: true,
    });
  }
};
