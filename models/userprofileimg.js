const mongoose = require('mongoose');
const userprofileschema = new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model("userprofileimg",userprofileschema);