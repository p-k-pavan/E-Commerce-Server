import express from "express"
import VerifyToken from "../middleware/VerifyToken";
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, updateCartItemQtyController } from "../controllers/cart.controller";


const router = express.Router();

router.post("/",VerifyToken,addToCartItemController);
router.put("/",VerifyToken,updateCartItemQtyController);
router.delete("/",VerifyToken,deleteCartItemQtyController);
router.get("/",VerifyToken,getCartItemController);

export default router;