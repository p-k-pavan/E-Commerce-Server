"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const user_router_1 = __importDefault(require("./router/user.router"));
const errorHandler_1 = require("./middleware/errorHandler");
const address_router_1 = __importDefault(require("./router/address.router"));
const category_router_1 = __importDefault(require("./router/category.router"));
const subCategory_controller_1 = __importDefault(require("./router/subCategory.controller"));
const product_router_1 = __importDefault(require("./router/product.router"));
const cart_route_1 = __importDefault(require("./router/cart.route"));
const upload_route_1 = __importDefault(require("./router/upload.route"));
const order_router_1 = __importDefault(require("./router/order.router"));
const app = (0, express_1.default)();
dotenv_1.default.config();
mongoose_1.default.connect(process.env.MONGODB_URL || "")
    .then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});
app.use((0, cors_1.default)({
    origin: [
        "https://www.namma-mart.shop",
        "https://www.namma-mart.shop/",
        "https://e-commerce-client-snowy.vercel.app",
        "https://e-commerce-client-snowy.vercel.app/",
        "http://localhost:3000"
    ],
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/api/users", user_router_1.default);
app.use("/api/address", address_router_1.default);
app.use("/api/category", category_router_1.default);
app.use("/api/subCategory", subCategory_controller_1.default);
app.use("/api/product", product_router_1.default);
app.use("/api/cart", cart_route_1.default);
app.use("/api/upload", upload_route_1.default);
app.use("/api/order", order_router_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.use((req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 404;
    const message = res.statusMessage || "Something went wrong";
    res.status(statusCode).json({
        success: false,
        message: message,
    });
    next();
});
app.use(errorHandler_1.errorHandler);
