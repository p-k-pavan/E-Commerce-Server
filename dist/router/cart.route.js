"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VerifyToken_1 = __importDefault(require("../middleware/VerifyToken"));
const cart_controller_1 = require("../controllers/cart.controller");
const router = express_1.default.Router();
router.post("/", VerifyToken_1.default, cart_controller_1.addToCartItemController);
router.put("/", VerifyToken_1.default, cart_controller_1.updateCartItemQtyController);
router.delete("/", VerifyToken_1.default, cart_controller_1.deleteCartItemQtyController);
router.get("/", VerifyToken_1.default, cart_controller_1.getCartItemController);
exports.default = router;
