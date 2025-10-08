import express from "express"
import VerifyToken from "../middleware/VerifyToken";
import { addAddress, deleteAddress, getAllAddress, updateAddress } from "../controllers/address.controller";

const router = express.Router();


router.post("/",VerifyToken,addAddress);
router.put("/:id",VerifyToken,updateAddress);
router.delete("/:id",VerifyToken,deleteAddress);
router.get("/",VerifyToken,getAllAddress);



export default router;