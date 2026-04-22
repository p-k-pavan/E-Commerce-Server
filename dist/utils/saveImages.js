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
exports.uploadImagesToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadImagesToCloudinary = (files, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { folder } = options;
    const imageUrls = [];
    for (const file of files) {
        const result = yield new Promise((resolve, reject) => {
            cloudinary_1.default.uploader
                .upload_stream({
                folder,
                resource_type: "image",
                format: "webp",
                quality: "auto",
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            })
                .end(file.buffer);
        });
        imageUrls.push(result.secure_url);
    }
    return imageUrls;
});
exports.uploadImagesToCloudinary = uploadImagesToCloudinary;
