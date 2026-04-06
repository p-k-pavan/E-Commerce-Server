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
router.post("/bulk-upload", VerifyToken_1.default, subCategory_controller_1.bulkUploadSubCategory);
router.get("/", subCategory_controller_1.getSubCategory);
router.get("/category/:slug", subCategory_controller_1.getSubCategoryByCategorySlug);
router.put("/:slug", VerifyToken_1.default, subCategory_controller_1.updateSubCategory);
router.delete("/:slug", VerifyToken_1.default, subCategory_controller_1.deleteSubCategory);
exports.default = router;
