"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uploadImageClodinary_1 = __importDefault(require("../utils/uploadImageClodinary"));
const uploadImageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                message: "No files uploaded",
                success: false,
                error: true,
            });
        }
        if (files.length > 7) {
            return res.status(400).json({
                message: "Maximum 7 files can be uploaded at once",
                success: false,
                error: true,
            });
        }
        const uploadedUrls = [];
        // Upload sequentially (maintains order)
        for (const file of files) {
            const url = yield (0, uploadImageClodinary_1.default)(file);
            uploadedUrls.push(url);
        }
        return res.json({
            message: "All files uploaded successfully in order",
            data: uploadedUrls,
            success: true,
            error: false,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false,
        });
    }
});
exports.default = uploadImageController;
