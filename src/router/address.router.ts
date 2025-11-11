import express from "express"
import VerifyToken from "../middleware/VerifyToken";
import { addAddress, deleteAddress, getAddressById, getAllAddress, updateAddress } from "../controllers/address.controller";

const router = express.Router();


router.post("/",VerifyToken,addAddress);
router.put("/:id",VerifyToken,updateAddress);
router.delete("/:id",VerifyToken,deleteAddress);
router.get("/:id",VerifyToken,getAddressById);
router.get("/",VerifyToken,getAllAddress);



export default router;