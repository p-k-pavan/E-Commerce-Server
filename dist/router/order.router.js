"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VerifyToken_1 = __importDefault(require("../middleware/VerifyToken"));
const order_controller_1 = require("../controllers/order.controller");
const router = express_1.default.Router();
router.post("/", VerifyToken_1.default, order_controller_1.cashonDelivery);
router.post("/online-payment", VerifyToken_1.default, order_controller_1.onlinePayment);
router.post("/verify-payment", VerifyToken_1.default, order_controller_1.verifyPayment);
router.get("/", VerifyToken_1.default, order_controller_1.getOrderDetails);
exports.default = router;
