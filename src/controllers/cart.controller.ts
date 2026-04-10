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

export const addToGuestCartController = async (req: Request, res: Response) => {
  try {
    const { productId, guestId } = req.body;

    if (!productId || !guestId) {
      return res.status(400).json({
        message: "Provide productId and guestId",
        error: true,
        success: false,
      });
    }

    const checkItem = await CartProductModel.findOne({
      guestId,
      productId,
    });

    if (checkItem) {
      return res.status(400).json({
        message: "Item already in cart",
      });
    }

    const cartItem = new CartProductModel({
      quantity: 1,
      guestId, 
      productId,
    });

    const save = await cartItem.save();

    return res.json({
      data: save,
      message: "Item added to guest cart",
      success: true,
      error: false,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      success: false,
      error: true,
    });
  }
};

export const getGuestCartController = async (req: Request, res: Response) => {
  try {
    const { guestId } = req.query;

    const cart = await CartProductModel.find({
      guestId,
    }).populate("productId");

    return res.json({
      cart,
      success: true,
      error: false,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      success: false,
      error: true,
    });
  }
};

export const updateGuestCartQtyController = async (req: Request, res: Response) => {
  try {
    const { _id, guestId, qty } = req.body;

    if (!_id || !guestId || qty === undefined) {
      return res.status(400).json({
        message: "Provide _id, guestId and qty",
        error: true,
        success: false,
      });
    }

    const cartItem = await CartProductModel.findOne({
      _id,
      guestId,
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
        error: true,
        success: false,
      });
    }

    if (qty === 0) {
      await CartProductModel.deleteOne({ _id, guestId });

      return res.json({
        message: "Item removed (qty = 0)",
        success: true,
        error: false,
      });
    }

    cartItem.quantity = qty;
    await cartItem.save();

    return res.json({
      message: "Guest cart updated",
      success: true,
      error: false,
      data: cartItem,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      success: false,
      error: true,
    });
  }
};

export const deleteGuestCartController = async (req: Request, res: Response) => {
  try {
    const { _id, guestId } = req.body;

    if (!_id || !guestId) {
      return res.status(400).json({
        message: "Provide _id and guestId",
        error: true,
        success: false,
      });
    }

    await CartProductModel.deleteOne({ _id, guestId });

    return res.json({
      message: "Item removed successfully",
      success: true,
      error: false,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      success: false,
      error: true,
    });
  }
};

export const syncCartController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.json({
        message: "No items to sync",
        success: true,
      });
    }

    for (const item of items) {
      const existing = await CartProductModel.findOne({
        userId,
        productId: item.productId,
      });

      if (existing) {
        existing.quantity += item.quantity;
        await existing.save();
      } else {
        await CartProductModel.create({
          userId,
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }

    return res.json({
      message: "Cart synced successfully",
      success: true,
    });

  } catch (error) {
    res.status(500).json({
      message: "Sync failed",
      success: false,
    });
  }
};
