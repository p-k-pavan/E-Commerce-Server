import express from "express";
import VerifyToken from "../middleware/VerifyToken";
import {
  addSubCategory,
  deleteSubCategory,
  getSubCategory,
  updateSubCategory,
  bulkUploadSubCategory,
  getSubCategoryByCategorySlug
} from "../controllers/subCategory.controller";

const router = express.Router();

router.post("/", VerifyToken, addSubCategory);

router.post("/bulk-upload", VerifyToken, bulkUploadSubCategory);

router.get("/", getSubCategory);

router.get("/category/:slug", getSubCategoryByCategorySlug);

router.put("/:slug", VerifyToken, updateSubCategory);

router.delete("/:slug", VerifyToken, deleteSubCategory);

export default router;