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
const cloudinary_1 = require("cloudinary");
const sharp_1 = __importDefault(require("sharp"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLODINARY_CLOUD_NAME,
    api_key: process.env.CLODINARY_API_KEY,
    api_secret: process.env.CLODINARY_API_SECRET_KEY,
});
const uploadToCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file)
        throw new Error("No file provided");
    // Resize before uploading
    const resizedBuffer = yield (0, sharp_1.default)(file.buffer)
        .resize({ width: 800, height: 600 })
        .toBuffer();
    // Use original file name as public_id (upload with order)
    const fileName = file.originalname.split(".")[0]; // remove extension
    // Upload stream
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            resource_type: "auto",
            folder: "E-Commerce",
            public_id: fileName,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
        }, (err, result) => {
            if (err)
                return reject(err);
            if (!result)
                return reject(new Error("Upload failed"));
            resolve(result.secure_url);
        });
        uploadStream.end(resizedBuffer);
    });
});
exports.default = uploadToCloudinary;
