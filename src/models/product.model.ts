import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    image: {
      type: [String],
      required: true,
      default: [],
    },

    // ✅ Use SINGLE ObjectId instead of array (IMPORTANT FIX)
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: true,
      index: true,
    },

    subCategory: {
      type: mongoose.Schema.ObjectId,
      ref: "subCategory",
      required: true,
      index: true,
    },

    unit: {
      type: String,
      required: true,
      default: "",
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    size: {
      type: String,
      default: null,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    description: {
      type: String,
      required: true,
      default: "",
    },

    more_details: {
      type: Object,
      default: {},
    },

    publish: {
      type: Boolean,
      default: true,
      index: true,
    },

    sellerName: {
      type: String,
      required: true,
    },

    sellerId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);



productSchema.index({ name: "text", description: "text" });

productSchema.index({ createdAt: -1 });

productSchema.pre("validate", function (next) {
  if (this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
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


const ProductModel = mongoose.model("product", productSchema);

export default ProductModel;