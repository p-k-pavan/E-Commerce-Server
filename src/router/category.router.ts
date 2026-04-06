import express from "express"
import VerifyToken from "../middleware/VerifyToken";
import { addCategory, deleteCategory, getCategory, updateCategory,bulkUploadCategory } from "../controllers/category.controller";

const router = express.Router();

router.post("/",VerifyToken,addCategory);
router.post("/bulk",VerifyToken,bulkUploadCategory);
router.put("/:id",VerifyToken,updateCategory);
router.delete("/:id",VerifyToken,deleteCategory);
router.get("/",getCategory);

export default router;
