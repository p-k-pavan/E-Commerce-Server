import express from "express";
import VerifyToken from "../middleware/VerifyToken";
import {
  getCategory,
  getCategoryWithSubCategories
} from "../controllers/category.controller";

const router = express.Router();



router.get("/", getCategory);

router.get("/allSubCategories", getCategoryWithSubCategories);

export default router;