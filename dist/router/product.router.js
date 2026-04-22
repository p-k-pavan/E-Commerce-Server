"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const router = express_1.default.Router();
router.get("/", product_controller_1.getProductController);
router.get("/home", product_controller_1.getHomePageData);
router.get("/search", product_controller_1.searchProduct);
router.get("/category/:slug", product_controller_1.getProductByCategory);
router.get("/category/:categorySlug/:subCategorySlug", product_controller_1.getProductByCategoryAndSubCategory);
router.get("/:slug", product_controller_1.getProductDetails);
exports.default = router;
