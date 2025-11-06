"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const addressSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    street: {
        type: String,
        required: [true, "provide street address"]
    },
    city: {
        type: String,
        required: [true, "provide city"]
    },
    state: {
        type: String,
        required: [true, "provide state"]
    },
    postalCode: {
        type: String,
        required: [true, "provide postal code"]
    },
    country: {
        type: String,
        required: [true, "provide country"]
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    mobile: {
        type: String,
        required: [true, "provide mobile number"]
    }
}, { timestamps: true });
const Address = mongoose_1.default.model("address", addressSchema);
exports.default = Address;
