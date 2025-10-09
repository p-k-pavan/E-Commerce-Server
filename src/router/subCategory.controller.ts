import express from "express"
import VerifyToken from "../middleware/VerifyToken";
import { addSubCategory, deleteSubCategory, getSubCategory, updateSubCategory } from "../controllers/subCategory.controller";

const router = express.Router();

router.post("/",VerifyToken,addSubCategory);
router.put("/:id",VerifyToken,updateSubCategory);
router.delete("/:id",VerifyToken,deleteSubCategory);
router.get("/",getSubCategory);

export default router;