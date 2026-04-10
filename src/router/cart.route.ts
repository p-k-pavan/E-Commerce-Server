import express from "express";
import VerifyToken from "../middleware/VerifyToken";

import {
  addToCartItemController,
  updateCartItemQtyController,
  deleteCartItemQtyController,
  getCartItemController,

  addToGuestCartController,
  getGuestCartController,
  updateGuestCartQtyController,
  deleteGuestCartController,

  syncCartController
} from "../controllers/cart.controller";

const router = express.Router();

router.get("/guest", getGuestCartController);        
router.post("/guest", addToGuestCartController);   
router.put("/guest", updateGuestCartQtyController);
router.delete("/guest", deleteGuestCartController);


router.get("/", VerifyToken, getCartItemController); 
router.post("/", VerifyToken, addToCartItemController); 
router.put("/", VerifyToken, updateCartItemQtyController); 
router.delete("/", VerifyToken, deleteCartItemQtyController);


router.post("/sync", VerifyToken, syncCartController);


export default router;