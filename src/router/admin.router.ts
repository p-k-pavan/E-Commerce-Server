import express from "express";
import { getCustomers, getCustomerStats } from "../controllers/admin/customer.controller";
import VerifyToken from "../middleware/VerifyToken";
import { deleteOrder, getOrderDetails, getOrders, getOrderStats, updateOrderDetails } from "../controllers/admin/order.controller";
import { addCategory, bulkUploadCategory, deleteCategory, getCategory, updateCategory } from "../controllers/admin/category.controller";
import { uploadImages } from "../middleware/uploadImages";
import { addSubCategory, bulkUploadSubCategory, deleteSubCategory, getSubCategory, updateSubCategory } from "../controllers/admin/subCategory.controller";
import { addProduct, bulkUploadProduct, deleteProduct, getProductController, getProductDetails, updateProductDetails } from "../controllers/admin/product.controller";


const router = express.Router();

router.get("/customers", getCustomers);
router.get("/customers/stats", getCustomerStats);

router.get("/status-stats", VerifyToken, getOrderStats);
router.get("/get-orders", VerifyToken, getOrders);
router.get("/detail/:orderId", VerifyToken, getOrderDetails);
router.patch("/update/:orderId", VerifyToken, updateOrderDetails);
router.delete("/delete/:orderId", VerifyToken, deleteOrder);


router.get("/category",getCategory);
router.patch(
  "/update-category/:slug",
  VerifyToken,
  uploadImages.single("file"),
  updateCategory
);
router.post(
  "/category/add",
  VerifyToken,
  uploadImages.single("file"),
  addCategory
);
router.post("/category/bulk", VerifyToken, bulkUploadCategory);
router.delete("category/:slug", VerifyToken, deleteCategory);


router.get("/sub-category",getSubCategory);
router.patch(
  "/update-sub-category/:slug",
  VerifyToken,
  uploadImages.single("file"),
  updateSubCategory
);
router.post(
  "/sub-category/add",
  VerifyToken,
  uploadImages.single("file"),
  addSubCategory
);
router.post("/sub-category/bulk", VerifyToken, bulkUploadSubCategory);
router.delete("/sub-category/:slug", VerifyToken, deleteSubCategory);



router.post(
  "/product/add",
  VerifyToken,
  uploadImages.array("files", 5),
  addProduct
);

router.patch(
  "/product/update/:slug",
  VerifyToken,
  uploadImages.array("files", 5),
  updateProductDetails
);


router.delete(
  "/product/delete/:slug",
  VerifyToken,
  deleteProduct
);

router.post(
  "/product/bulk-upload",
  VerifyToken,
  bulkUploadProduct
);


router.get(
  "/product/get",
  getProductController
);

router.get(
  "/product/:slug",
  getProductDetails
);
export default router;