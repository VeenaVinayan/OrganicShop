const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    catName : {
           type : String,
           required : true,
    },
    catStatus : {
        type : Boolean,
        default:true,
    }
});

module.exports = mongoose.model('Category',categorySchema);