import express from "express"
import VerifyToken from "../middleware/VerifyToken";
import { addProduct, deleteProduct, getProductByCategory, getProductByCategoryAndSubCategory, getProductController, getProductDetails, searchProduct, updateProductDetails } from "../controllers/product.controller";


const router = express.Router();

router.post("/",VerifyToken,addProduct);
router.put("/:id",VerifyToken,updateProductDetails);
router.delete("/:id",VerifyToken,deleteProduct);
router.get("/:id",getProductDetails);
router.post('/search-product',searchProduct)
router.post("/get",getProductController);
router.post("/get-product-by-category",getProductByCategory)
router.post('/get-product-by-category-and-subcategory',getProductByCategoryAndSubCategory)

export default router;