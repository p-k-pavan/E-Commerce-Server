"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VerifyToken_1 = __importDefault(require("../middleware/VerifyToken"));
const subCategory_controller_1 = require("../controllers/subCategory.controller");
const router = express_1.default.Router();
router.post("/", VerifyToken_1.default, subCategory_controller_1.addSubCategory);
router.post("/get-subcategory-by-categoryId", subCategory_controller_1.getSubCategoryByCategory);
router.put("/:id", VerifyToken_1.default, subCategory_controller_1.updateSubCategory);
router.delete("/:id", VerifyToken_1.default, subCategory_controller_1.deleteSubCategory);
router.get("/", subCategory_controller_1.getSubCategory);
exports.default = router;
