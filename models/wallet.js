const mongoose = require("mongoose");
const moment = require("moment")

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',     
    }, 
    amount: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now,
      get: function(val){
           return moment(val).format('DD-MM-YYYY')
      }
    }
  }],
  referalCode: {
    code: {
      type: String,
    },
    redeemStatus:{
      type:Boolean,
    }
 }
});
module.exports = mongoose.model('Wallet', walletSchema);
