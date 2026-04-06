import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    name : {
        type : String,
        default : ""
    },
    image : {
        type : String,
        default : ""
    },
    slug: {
        type: String,
        lowercase: true,
        trim: true
    },
    category : {
        type : mongoose.Schema.ObjectId,
        ref : "category"
    }
},{
    timestamps : true
});

subCategorySchema.index({ category: 1 });
subCategorySchema.index({ slug: 1 }, { unique: true });

subCategorySchema.pre("save", function (next) {
    if (this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
    }
    next();
});

const SubCategoryModel = mongoose.model('subCategory', subCategorySchema);

export default SubCategoryModel;