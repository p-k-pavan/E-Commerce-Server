import express from "express"
import VerifyToken from "../middleware/VerifyToken";
import { addSubCategory, deleteSubCategory, getSubCategory, getSubCategoryByCategory, updateSubCategory } from "../controllers/subCategory.controller";

const router = express.Router();

router.post("/",VerifyToken,addSubCategory);
router.post("/get-subcategory-by-categoryId",getSubCategoryByCategory)
router.put("/:id",VerifyToken,updateSubCategory);
router.delete("/:id",VerifyToken,deleteSubCategory);
router.get("/",getSubCategory);

export default router;