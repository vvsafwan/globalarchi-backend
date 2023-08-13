const mongoose = require('mongoose');
const projectdetailsSchema = new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },
    projects:[{
        projectname:{
            type:String,
            required:true
        },
        projectaddress:{
            type:String,
            required:true
        },
        projectyear:{
            type:Number,
            required:true
        },
        projectcost:{
            type:String,
            required:true
        },
        projectlink:{
            type:String,
            default:""
        },
        image:{
            type:Array
        }
    }]
})

const projectdetailModel = mongoose.model("projectdetail",projectdetailsSchema);
module.exports = projectdetailModel;