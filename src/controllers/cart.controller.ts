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
            data : cartItem,
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

export const updateCartItemQtyController = async(req: Request, res: Response)=>{
    try {
        const userId = req.userId 
        const { _id,qty } = req.body

        if(!_id ||  !qty){
            return res.status(400).json({
                message : "provide _id, qty"
            })
        }

        const updateCartitem = await CartProductModel.updateOne({
            _id : _id,
            userId : userId
        },{
            quantity : qty
        })

        return res.json({
            message : "Update cart",
            success : true,
            error : false, 
            data : updateCartitem
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

export const deleteCartItemQtyController = async(req: Request, res: Response)=>{
    try {
      const userId = req.userId
      const { _id } = req.body 
      
      if(!_id){
        return res.status(400).json({
            message : "Provide _id",
            error : true,
            success : false
        })
      }

      const deleteCartItem  = await CartProductModel.deleteOne({_id : _id, userId : userId })

      return res.json({
        message : "Item remove",
        error : false,
        success : true,
        data : deleteCartItem
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