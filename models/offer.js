
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
      name:{
         type:String,
         required:true,
      },
      category:{
         type:mongoose.Schema.Types.ObjectId,
         required : true,
      },
      startDate:{
         type:Date,
         required : true,
      },
      endDate:{
         type:Date,
         required :true,
      },
      percentage:{
        type:Number,
        required:true,
      },
      status:{
        type:Boolean,
        default: true,
      }
});

module.exports = mongoose.model('Offer',offerSchema);