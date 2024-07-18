const Wallet = require('../models/wallet');
const User = require('../models/user');
const Category = require('../models/category');


module.exports ={
     viewWallet : async (req,res) =>{
          const wallet = await Wallet.findOne({user:req.session.userId});
          const userData = await User.findOne({'_id':req.session.userId});
          const category = await Category.find({catStatus:true},'_id catName');
          res.render('./shop/wallet',{
                userData : userData,
                wallet : wallet,
                category:category,
                user:req.session.user,
                count:0,
          });
     },
     rechargeWallet: async (req,res) => {
       try {
          c
          const {amount}=req.body;
          const{userId}=req.session;
          const regEx=/^(100|[1-9]\d{2,3}|10000)$/
          if(amount !== "" && regEx.test(amount.toString())){
               await Wallet.updateOne({user: userId},{ 
                     $inc: {balance: amount} ,
                     $push: { transactions: { amount: amount, status: 'Recharge', type: 'credit' } }  }    
               ).then(result =>{
                    if(result.nModified > 0){
                         console.log("Wallet updated Successfully",result);
                    }else{
                         console.log("Wallet not updated || ",result);
                    }
               }).catch(err =>{
                    console.log("Error occured ::"+err);
               });
            
         }else{
               req.flash('error',"Amount is too low ...")
               res.redirect('/wallet');
          }
          res.redirect('/wallet');
     }catch(err){
           console.log("Error occured :: "+err);
     } 
   }
}
