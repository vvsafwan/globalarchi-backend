const mongoose = require('mongoose');
const bannerschema = new mongoose.Schema({
    header:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    status:{
        type:Boolean,
        default:true
    }
})

const bannermodel = mongoose.model("banner",bannerschema);
module.exports = bannermodel