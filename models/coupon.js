const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    user:[{
         type:mongoose.Schema.Types.ObjectId,
         ref:'User'
    }],
    coupon:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    isListed:{
        type:Boolean,
        default:true,
    },
    percentage:{
        type:Number,
        required:true,
    },
    minimumAmount:{
        type:Number,
        required:true,
    },
    maximumAmount:{
        type:Number,
        required:true,
    },
    expiryDate:{
        type:Date,
    }
},{timestamps:true});
module.exports = mongoose.model('Coupon',couponSchema);