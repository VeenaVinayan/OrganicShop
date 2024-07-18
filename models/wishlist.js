const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
   user :{
       type:mongoose.Schema.Types.ObjectId,
       required : true,
       ref:'User'
   },
   items:[{
      product:{
          type : mongoose.Schema.Types.ObjectId,
          required:true,
          ref:'Product'
      },
      date :{ 
         type: Date,
         default: Date.now,
      }
   }]
});
module.exports=mongoose.model('Wishlist',wishlistSchema);