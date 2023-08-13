const mongoose = require('mongoose');
const objectId = mongoose.Types.ObjectId;
const connectionSchema = new mongoose.Schema({
    connections:{
        user:{
            type: objectId,
            ref:"user",
            required:true
        },
        professional:{
            type: objectId,
            ref:"professional",
            required:true
        }
    }
},{
    timestamps: true
})

module.exports = mongoose.model("connection",connectionSchema);