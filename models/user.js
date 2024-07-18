const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    isBlock:{
        type:Boolean,
        default:false,
    },
    token :{
         otp: {
             type : Number,
         },
         created : {
              type :Date,
         }
    },
    isVerified : {
         type : Boolean,
         default:false,
       },
    referralCode:{
         type:String,
         unique:true,
    }   
});

//Export the model
module.exports = mongoose.model('User', userSchema);