"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VerifyToken_1 = __importDefault(require("../middleware/VerifyToken"));
const address_controller_1 = require("../controllers/address.controller");
const router = express_1.default.Router();
router.post("/", VerifyToken_1.default, address_controller_1.addAddress);
router.put("/:id", VerifyToken_1.default, address_controller_1.updateAddress);
router.delete("/:id", VerifyToken_1.default, address_controller_1.deleteAddress);
router.get("/:id", VerifyToken_1.default, address_controller_1.getAddressById);
router.get("/", VerifyToken_1.default, address_controller_1.getAllAddress);
exports.default = router;
