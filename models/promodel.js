const mongoose = require('mongoose');
const proschema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_varified:{
        type:Boolean,
        default:false
    },
    is_admin:{
        type:Boolean,
        default:false
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    image:{
        type:String
    },
    otp:{
        type:String,
        default:''
    },
    token:{
        type:String,
        default:''
    }
})

const promodel = mongoose.model("professional",proschema);
module.exports = promodel;