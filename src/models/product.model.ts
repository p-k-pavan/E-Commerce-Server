import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    },
    image : {
        type : Array,
        default : [],
        required: true
    },
    category : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'category'
        }
    ],
    subCategory : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'subCategory'
        }
    ],
    unit : {
        type : String,
        default : "",
        required: true
    },
    stock : {
        type : Number,
        default : null,
        required: true
    },
    price : {
        type : Number,
        default : null,
        required: true

    },
    discount : {
        type : Number,
        default : null
    },
    description : {
        type : String,
        default : "",
        required: true
    },
    more_details : {
        type : Object,
        default : {}
    },
    publish : {
        type : Boolean,
        default : true
    },
    sellerName: {
        type: String,
        required: true
    },
    sellerId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
},{
    timestamps : true
});

productSchema.index({ name: "text", category: 1, sellerId: 1 });

const ProductModel = mongoose.model('product',productSchema)

export default ProductModel