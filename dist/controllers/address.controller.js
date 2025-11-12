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
exports.getAddressById = exports.updateAddress = exports.deleteAddress = exports.getAllAddress = exports.addAddress = void 0;
const address_model_1 = __importDefault(require("../models/address.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
// add Address
const addAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({
                message: "Unauthorize",
                error: true,
                success: false
            });
        }
        const { street, city, state, postalCode, country, mobile, isDefault } = req.body;
        if (!userId || !street || !city || !state || !postalCode || !country || !mobile) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (isDefault) {
            yield address_model_1.default.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } });
        }
        const newAddress = new address_model_1.default({
            userId,
            street,
            city,
            state,
            postalCode,
            country,
            mobile,
            isDefault: !!isDefault
        });
        yield newAddress.save();
        // Add address to user's address_details array
        yield user_model_1.default.findByIdAndUpdate(userId, { $push: { address_details: newAddress._id } });
        res.status(201).json({
            message: "Address added successfully",
            address: newAddress,
            error: false,
            success: true
        });
    }
    catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error
            ? error.message
            : "Server error";
        res.status(500).json({
            message: errorMessage,
            error: true,
            success: false,
        });
    }
});
exports.addAddress = addAddress;
// get all address
const getAllAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({
                message: "Unauthorize",
                error: true,
                success: false
            });
        }
        const addresses = yield address_model_1.default.find({ userId: userId }).sort({ createdAt: -1 });
        if (addresses.length === 0) {
            return res.status(404).json({
                message: "No addresses found",
                error: true,
                success: false
            });
        }
        res.status(200).json({
            message: "Addresses fetched successfully",
            addresses,
            error: false,
            success: true
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Server error",
            error: true,
            success: false,
        });
    }
});
exports.getAllAddress = getAllAddress;
// delete address
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const addressId = req.params.id;
        if (!userId) {
            return res.status(400).json({
                message: "Unauthorize",
                error: true,
                success: false
            });
        }
        if (!addressId) {
            return res.status(400).json({ message: "Address id is required" });
        }
        const address = yield address_model_1.default.findOne({ _id: addressId, userId: userId });
        if (!address) {
            return res.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            });
        }
        yield address_model_1.default.findByIdAndDelete(addressId);
        // Remove address from user's address_details array
        yield user_model_1.default.findByIdAndUpdate(userId, { $pull: { address_details: addressId } });
        res.status(200).json({
            message: "Address deleted successfully",
            error: false,
            success: true
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Server error",
            error: true,
            success: false,
        });
    }
});
exports.deleteAddress = deleteAddress;
// update address
const updateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const addressId = req.params.id;
        console.log(userId);
        console.log(addressId);
        const { street, city, state, postalCode, country, mobile, isDefault } = req.body;
        if (!userId) {
            return res.status(400).json({
                message: "Unauthorize",
                error: true,
                success: false
            });
        }
        if (isDefault) {
            yield address_model_1.default.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } });
        }
        const updatedAddress = yield address_model_1.default.findOneAndUpdate({ _id: addressId, userId }, { street, city, state, postalCode, country, mobile, isDefault: !isDefault }, { new: true });
        if (!updatedAddress) {
            return res.status(404).json({
                message: "Address not found 1",
                error: true,
                success: false
            });
        }
        res.status(200).json({
            message: "Address updated successfully",
            address: exports.updateAddress,
            error: false,
            success: true
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Server error",
            error: true,
            success: false,
        });
    }
});
exports.updateAddress = updateAddress;
const getAddressById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const addressId = req.params.id;
        if (!userId) {
            return res.status(400).json({
                message: "Unauthorize",
                error: true,
                success: false
            });
        }
        const address = yield address_model_1.default.findOne({ _id: addressId, userId });
        if (!address) {
            return res.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            });
        }
        res.status(200).json({
            message: "Address fetched successfully",
            address,
            error: false,
            success: true
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Server error",
            error: true,
            success: false,
        });
    }
});
exports.getAddressById = getAddressById;
