const Wallet = require('../models/wallet');
const User = require('../models/user');
const Category = require('../models/category');
const Cart = require('../models/cart');
const PER_PAGE = 5;

module.exports ={
     viewWallet : async (req,res) =>{
          const {userId,user} = req.session;
          let page = Number(req.query.page);
          if(isNaN(page)|| page<1){
               page=1;
          }
          const [userData,wallet,category,cart] = await Promise.all( [
             User.findOne({'_id':userId}),
             Wallet.findOne({user:userId}),
             Category.find({catStatus:true},'_id catName'),
             Cart.findOne({user:userId}),
           ]);
          
          let cartCount = cart ? cart.items.length :0;
          res.render('./shop/wallet',{
                userData : userData,
                wallet : wallet,
                category:category,
                user:user,
                count:cartCount,
          });
     },
     rechargeWallet: async (req,res) => {
       try {
          const {amount}=req.body;
          const{userId}=req.session;
          const regEx=/^(100|[1-9]\d{2,3}|10000)$/
          if(amount !== "" && regEx.test(amount.toString()) && amount>0){
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
               req.flash('error',"Invalid amount !!")
               res.redirect('/wallet');
          }
          res.redirect('/wallet');
     }catch(err){
           console.log("Error occured :: "+err);
     } 
   }
}
