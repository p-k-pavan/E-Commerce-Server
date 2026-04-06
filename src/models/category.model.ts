import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        required: true,
        trim: true
    },
    image : {
        type : String,
        default : "https://static.vecteezy.com/system/resources/previews/048/215/948/original/icon-loading-illustration-free-vector.jpg"
    },
    slug: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true
    }
},{
    timestamps : true
});


categorySchema.index({ slug: 1 });


categorySchema.pre("save", function (next) {
    if (this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
    }
    next();
});

const CategoryModel = mongoose.model('category', categorySchema);

export default CategoryModel;