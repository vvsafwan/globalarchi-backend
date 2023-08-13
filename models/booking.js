const mongoose = require('mongoose');
const objectId = mongoose.Types.ObjectId;
const bookingSchema = mongoose.Schema({
    professional:{
        type:objectId,
        ref:"professional",
        required:true
    },
    user:{
        type:objectId,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    state:{
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
    date:{
        type:Date,
        required:true
    },
    status:{
        type:Boolean,
        default:false
    },
    paymentId:{
        type:String,
        default:''
    }
})

module.exports = mongoose.model('booking',bookingSchema);