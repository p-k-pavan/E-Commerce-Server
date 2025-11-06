"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VerifyToken_1 = __importDefault(require("../middleware/VerifyToken"));
const category_controller_1 = require("../controllers/category.controller");
const router = express_1.default.Router();
router.post("/", VerifyToken_1.default, category_controller_1.addCategory);
router.put("/:id", VerifyToken_1.default, category_controller_1.updateCategory);
router.delete("/:id", VerifyToken_1.default, category_controller_1.deleteCategory);
router.get("/", category_controller_1.getCategory);
exports.default = router;
