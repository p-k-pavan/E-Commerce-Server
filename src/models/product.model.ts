import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    image: {
        type: [String],
        default: [],
        required: true
    },

    category: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'category',
            required: true
        }
    ],

    subCategory: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'subCategory',
            required: true
        }
    ],

    unit: {
        type: String,
        default: "",
        required: true
    },

    stock: {
        type: Number,
        default: 0,
        min: 0
    },

    size: {
        type: String,
        default: null
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100 
    },

    description: {
        type: String,
        default: "",
        required: true
    },

    more_details: {
        type: Object,
        default: {}
    },

    publish: {
        type: Boolean,
        default: true
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

}, {
    timestamps: true
});


productSchema.index({ name: "text", description: "text" });

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1, subCategory: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ publish: 1 });


productSchema.pre("validate", function (next) {
    if (this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, "")   // remove special chars
            .replace(/\s+/g, "-");        // spaces → dash
    }
    next();
});


productSchema.pre("save", async function (next) {
    if (!this.isModified("slug")) return next();

    let slug = this.slug;
    let count = 0;

    while (await mongoose.models.product.findOne({ slug })) {
        count++;
        slug = `${this.slug}-${count}`;
    }

    this.slug = slug;
    next();
});


const ProductModel = mongoose.model('product', productSchema);

export default ProductModel;