import express from "express";
import VerifyToken from "../middleware/VerifyToken";
import {
  addProduct,
  bulkUploadProduct,
  deleteProduct,
  getHomePageData,
  getProductByCategory,
  getProductByCategoryAndSubCategory,
  getProductController,
  getProductDetails,
  searchProduct,
  updateProductDetails
} from "../controllers/product.controller";

const router = express.Router();


router.post("/", VerifyToken, addProduct);

router.post("/bulk", VerifyToken, bulkUploadProduct);

router.put("/:slug", VerifyToken, updateProductDetails);

router.delete("/:slug", VerifyToken, deleteProduct);

router.get("/", getProductController);

router.get("/home", getHomePageData);

router.get("/search", searchProduct);

router.get("/category/:slug", getProductByCategory);

router.get("/category/:categorySlug/:subCategorySlug", getProductByCategoryAndSubCategory);

router.get("/:slug", getProductDetails);


export default router;