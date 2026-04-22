import express from "express";
import VerifyToken from "../middleware/VerifyToken";
import {
  getSubCategory,
  getSubCategoryByCategorySlug
} from "../controllers/subCategory.controller";

const router = express.Router();


router.get("/", getSubCategory);

router.get("/category/:slug", getSubCategoryByCategorySlug);

export default router;