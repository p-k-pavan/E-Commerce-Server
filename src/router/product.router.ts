import express from "express";
import {
  getHomePageData,
  getProductByCategory,
  getProductByCategoryAndSubCategory,
  getProductController,
  getProductDetails,
  searchProduct
} from "../controllers/product.controller";

const router = express.Router();

router.get("/", getProductController);

router.get("/home", getHomePageData);

router.get("/search", searchProduct);

router.get("/category/:slug", getProductByCategory);

router.get("/category/:categorySlug/:subCategorySlug", getProductByCategoryAndSubCategory);

router.get("/:slug", getProductDetails);


export default router;