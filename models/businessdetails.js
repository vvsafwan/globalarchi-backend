const mongoose = require('mongoose');
const businessdetailsSchema = new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },
    website:{
        type:String,
        default:""
    },
    budget:{
        type:String,
        required:true
    },
    about:{
        type:String,
        required:true
    },
    costdetails:{
        type:String,
        required:true
    },  
    businessdescription:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    awards:{
        type:String,
        default:""
    },
    is_varified:{
        type:String,
        default:false
    }
})

const businessdetailsModel = mongoose.model("businessdetails",businessdetailsSchema);
module.exports = businessdetailsModel