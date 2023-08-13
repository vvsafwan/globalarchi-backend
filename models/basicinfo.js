const mongoose = require('mongoose');
const basicInfoSchema = new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },
    companyname:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    pincode:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    is_blocked:{
        type:Boolean,
        default:false
    }
})

const basicInfoModel = mongoose.model("basicinfo",basicInfoSchema);
module.exports = basicInfoModel;