import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
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
        type: Number,
        required: [true, "provide mobile number"]
    }
}, { timestamps: true });


const Address = mongoose.model("address", addressSchema);
export default Address;