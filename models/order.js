const mongoose =require('mongoose');
const moment = require('moment');

const orderSchema = new mongoose.Schema({
      items: [{
          product :{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required : true,
          },
          quantity: {
           type: Number,
            required : true, 
          },
          size : {
             type : String,
             required : true,  
          },
          price: {
             type : Number,
             required : true,
         },
         discount: {
            type : Number,
            required : true,
         },
         total : {
            type: Number,
            required : true,
         }
        }],
        grandTotal : {
            type :Number,
            required : true,
        },  
        totalDiscount : {
            type : Number,
            required : true,
        },
        amount :{
             type : Number,
             required : true, 
        },
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref:'User',
            required: true,
        },
        date : {
               type : Date,
               required:true,
               get: function(val){
                 return moment(val).format('YYYY-MM-DD');
               }
        },
        status : {
            type :String,
            required: true,
        },
        address:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Address',
            required:true,
        },
        paymentMode:{
            type : String,
            required:true,
        },
        payStatus:{
             type: Boolean,
        },
        deliveredDate:{
             type:Date,
        },
        coupon:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Coupon',
        },
        couponDiscount:{
            type:Number,
        }
 },{timestamps:true});
 module.exports = mongoose.model('Order',orderSchema);