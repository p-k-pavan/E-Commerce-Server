import express from "express";
import VerifyToken from "../middleware/VerifyToken";
import {
  addCategory,
  deleteCategory,
  getCategory,
  updateCategory,
  bulkUploadCategory,
  getCategoryWithSubCategories
} from "../controllers/category.controller";

const router = express.Router();

router.post("/", VerifyToken, addCategory);

router.post("/bulk", VerifyToken, bulkUploadCategory);

router.get("/", getCategory);

router.get("/allSubCategories", getCategoryWithSubCategories);

router.put("/:slug", VerifyToken, updateCategory);

router.delete("/:slug", VerifyToken, deleteCategory);

export default router;