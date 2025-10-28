import express from "express"
import VerifyToken from "../middleware/VerifyToken";
import { cashonDelivery, getOrderDetails } from "../controllers/order.controller";

const router = express.Router();

router.post("/",VerifyToken,cashonDelivery);
router.get("/",VerifyToken,getOrderDetails);

export default router;