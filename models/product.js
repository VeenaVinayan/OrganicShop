const mongoose =require('mongoose');

const productSchema = new mongoose.Schema({
    productName : {
               type : String,
               required :true,
    },
    description : {
               type : String,
               required : true,
    },
    category: {
           type : mongoose.Schema.Types.ObjectId,
           required : true,
           ref:"Category"
    },
    brand: {
         type : String,
         required : true,
    },
    varient: [{
      quantity: {
            type : Number,
            required : true,
         },
       price : {
          type :Number,
          required : true,
       },
      size : {
         type :String,
         required : true,
     },
       discount :{
         type :Number,
         required:true,
       }
    }],
    image: {
        type : Array,
        required : true,
    },
    status : {
         type:Boolean,
         default : true,
    },
   rating : {
        type : Number,

    }

},{timestamps:true} ); 

module.exports = mongoose.model('Product',productSchema);