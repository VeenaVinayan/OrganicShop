const mongoose = require('mongoose');

const varientSchema = new mongoose.Schema({
     name : {
           type : String,
           requied : true
     },
     status :{
         type:Boolean,
         default : true,

     }
});
module.exports = mongoose.model('Varient',varientSchema);
