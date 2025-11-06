"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VerifyToken_1 = __importDefault(require("../middleware/VerifyToken"));
const product_controller_1 = require("../controllers/product.controller");
const router = express_1.default.Router();
router.post("/", VerifyToken_1.default, product_controller_1.addProduct);
router.put("/:id", VerifyToken_1.default, product_controller_1.updateProductDetails);
router.delete("/:id", VerifyToken_1.default, product_controller_1.deleteProduct);
router.get("/:id", product_controller_1.getProductDetails);
router.post('/search-product', product_controller_1.searchProduct);
router.post("/get", product_controller_1.getProductController);
router.post("/get-product-by-category", product_controller_1.getProductByCategory);
router.post('/get-product-by-category-and-subcategory', product_controller_1.getProductByCategoryAndSubCategory);
exports.default = router;
