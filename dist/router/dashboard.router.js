"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const VerifyToken_1 = __importDefault(require("../middleware/VerifyToken"));
const dashboard_controller_1 = require("../controllers/dashboard.controller");
router.get("/stats", VerifyToken_1.default, dashboard_controller_1.getDashboardStats);
exports.default = router;
