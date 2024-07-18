const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
     user : {
          type : mongoose.Schema.Types.ObjectId,
          required : true,
          ref : "User"
     },
     items : [ { 
         product:{
              type : mongoose.Schema.Types.ObjectId,
              required : true,
              ref:"Product"
            },
         size:{
               type : String,
               required : true,
            },
         quantity : {
             type: Number,
             default:1
           }
        }],
   });

module.exports = mongoose.model('Cart',cartSchema);