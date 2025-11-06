"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const subCategorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    category: [
        {
            type: mongoose_1.default.Schema.ObjectId,
            ref: "category"
        }
    ]
}, {
    timestamps: true
});
const SubCategoryModel = mongoose_1.default.model('subCategory', subCategorySchema);
exports.default = SubCategoryModel;
