import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    },
    image : {
        type : String,
        default : "https://static.vecteezy.com/system/resources/previews/048/215/948/original/icon-loading-illustration-free-vector.jpg"
    }
},{
    timestamps : true
})

const CategoryModel = mongoose.model('category',categorySchema)

export default CategoryModel