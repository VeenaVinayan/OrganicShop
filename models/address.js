const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    firstName : {
         type: String,
         required:true,
    },
    lastName : {
         type : String,
    },
    mobile:{
        type : String,
        required : true,
    },
    house:{
        type : String,
        required :true,
    },
    landMark:{
        type: String,
    },
    street :{
        type: String,
    },
    place : {
         type: String,
         required : true,
    },
    city : {
        type:String,
        required:true
    },
    pincode:{
        type: Number,
        required: true,
    },
    state : {
        type: String,
        required : true,
    },
    country : {
         type:String,
         required : true,
    },
    type:{
        type : String,
        required : true,
    },
    userId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
 });

 module.exports = mongoose.model("Address",addressSchema);