const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
    proid:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    review:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        default:0
    }
})

const reviewModel = mongoose.model("review",reviewSchema)
module.exports = reviewModel