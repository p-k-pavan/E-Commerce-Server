import express from "express"
import VerifyToken from "../middleware/VerifyToken";
import { cashonDelivery, getOrderById, getOrderDetails, onlinePayment, verifyPayment } from "../controllers/order.controller";

const router = express.Router();

router.post("/",VerifyToken,cashonDelivery);
router.post("/online-payment",VerifyToken,onlinePayment);
router.post("/verify-payment", VerifyToken, verifyPayment);
router.get("/",VerifyToken,getOrderDetails);
router.get("/:id",VerifyToken,getOrderById);

export default router;