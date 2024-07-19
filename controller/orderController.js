const Cart = require('../models/cart');
const Address = require('../models/address');
const Category = require('../models/category');
const Order = require('../models/order');
const Product = require('../models/product');
const moment = require('moment');
const Coupon = require('../models/coupon');
const Wallet = require('../models/wallet');
const User = require('../models/user');
const coupon = require('../models/coupon');
const { json } = require('body-parser');

module.exports = {
     placeOrder : async (req,res) => {
       
     try {        
          let objectId;
          let status='Placed';
          const{ userId } = req.session;

          try {
              // Check for Referral offer
              const count = await Order.countDocuments({ user: userId });
                       
              if (count === 1) {
                  const codeReffered = await Wallet.findOne({ user: userId }, { referalCode: 1 });
                           
                  if (codeReffered && codeReffered.referalCode && codeReffered.referalCode.code && codeReffered.referalCode.redeemStatus === false) {
                             
                      const userReferred = await User.findOne({ referralCode: codeReffered.referalCode.code });
                                
                      if (userReferred) {
                          const result = await Wallet.updateOne(
                              { user: userReferred._id },
                              {
                                  $inc: { balance: 1000 },
                                  $push: { transactions: { amount: 1000, status: 'Referral Offer', type: 'credit' } }
                              }
                          );
          
                          await Wallet.updateOne(
                              { user: userId },
                              {
                                  $inc: { balance: 1000 },
                                  $push: { transactions: { amount: 1000, status: 'Referral Offer', type: 'credit' } },
                                  $set: { 'referalCode.redeemStatus': true }
                              }
                          );
          
                          console.log(`Result = ${result.matchedCount} Modified :: ${result.modifiedCount}`);
                      } else {
                          console.error("Referred user not found.");
                      }
                  }
              }
          } catch (err) {
              console.error("Error in processing referral offer: " + err);
          }
        
          let { address,paymentMethod,couponName,isPaymentFailed } = req.body;
          const cart = await Cart.findOne({user:userId}).populate('items.product');
          let couponData;
          let total,discount,grandTotal,subTotal,totalDiscount,amount,couponDiscount,coupon;
          grandTotal = totalDiscount = 0 ;
          let cartItems = [];
          let item;
          console.log(cart);
          cart.items.forEach((row)=> {
                row.product.varient.forEach((val) => {
                     if(row.size === val.size){
                          subTotal= row.quantity * val.price;
                          discount = val.discount * row.quantity;
                          item = {
                             product: row.product._id,
                             quantity :row.quantity,
                             size :  row.size,
                             price : val.price,
                             discount : discount,
                             total : subTotal,
                          } 
                     }
                });
                cartItems.push(item);
                grandTotal += subTotal;
                totalDiscount += discount;
          });
          amount = grandTotal - totalDiscount ;
          if(couponName){
               couponData = await Coupon.findOne({'_id':couponName});
               console.log("Coupon applied ::: "+ couponData);
               if(amount >= couponData.minimumAmount){
                    couponDiscount = Math.round(amount * couponData.percentage/100);
                    if(couponData.maximumAmount< couponDiscount){
                         couponDiscount = couponData.maximumAmount;
                    }
                    amount-=couponDiscount;
               }
               await Coupon.updateOne({'_id':couponData._id},
                   { $push: {user:userId } }
              );
              coupon=couponData._id; 
          }else{
               coupon = null;
               couponDiscount=0;
          }
        // Checking for payment Method  
          switch(paymentMethod){
               case 'COD' :
                           pay = false;
                           break;
               case 'Wallet' :
                           pay = true;
                           break;
               case 'RazorPay':
                          if(isPaymentFailed === 'true'){
                               pay=false;
                               status="Failed Payment";
                          }if(isPaymentFailed === 'false'){
                               pay=true;
                          }  
                         break;
               default :
                        console.log("No valid payment method!");          
              }                                 
                   
          const orderData = new Order({ 
            items : cartItems,
            grandTotal : grandTotal,
            totalDiscount : totalDiscount,
            amount : amount,
            user:userId,
            date : Date.now(),
            status:status,    
            address : address,
            paymentMode : paymentMethod,
            payStatus:pay,
            coupon:coupon,
            couponDiscount:couponDiscount,
          });
          await orderData.save().then(doc =>{
               objectId=doc._id;
          })
        
          if(paymentMethod === 'Wallet'){
               await Wallet.updateOne({user:userId},{
                    $inc:{balance : (-1*amount)},
                    $push:{transactions: {orderId:objectId,amount:amount,status:'Purchase',type:'Debit'}}
               });
          }
          await cart.deleteOne({user:userId});
          const [  category,order ]= await Promise.all([
                    Category.find({catStatus:true}),
                    Order.findOne({_id:objectId}).populate('address').populate('items.product'),
           ]) ;
          res.render('./shop/orderSuccess',{
               category : category,
               user : req.session.user,
               count : 0,
               order
          });
     }catch(err){
         console.log("Error occured ::"+err);
     }
   },
    checkOutView : async (req,res) => {
      try{
         const {id } = req.params;
         const category =  await Category.find({catStatus:true});
         const cartValues = await Cart.findOne({user: id}).populate('items.product');
         const address = await Address.find({userId:id});
         const wallet = await Wallet.findOne({user:id});
         const userData = await User.findOne({'_id':id},{name:1,email:1,mobile:1});

         let cartCount;
         let today = Date.now();
         const coupon = await Coupon.find({isListed:true,expiryDate:{$gt: today}});
         cartCount = cartValues ? cartValues.items.length:0;
         
         res.render('./shop/placeOrder',{
           category : category,
           user: req.session.user,
           count: cartCount,
           cart: cartValues,
           address:address,
           coupon:coupon,
           wallet:wallet,
           userData:userData,
       });        
     }catch(err){
           console.log("Error in rendering :: " +err);
      }
     },
     doCancelOrder : async (req,res) => {
           try{
                const  {id } =req.params;
                let status;
                const order = await Order.findOne({'_id':id});
                if((order.paymentMode === 'RazorPay' && order.status === 'Placed')|| order.paymentMode === 'Wallet'){
                     await Wallet.updateOne({user:order.user},
                         {
                              $inc:{balance:order.amount},
                              $push: { transactions: { amount: order.amount, status: 'Refund after Cancel Order', type: 'credit' } }
                         }
                     );
                }
                const updatePromises = order.items.map(row => {
                    return Product.updateOne(
                         {_id:row.product._id,'varient.size':row.size},
                         {$inc: {'varient.$.quantity':row.quantity}}
                    );
               }) ;
               const results= await Promise.all(updatePromises);
                await Order.updateOne({'_id':id},
                      {$set: {status:'Cancelled',payStatus:false}}
                );
               console.log("Update Results ::"+results);
               res.status(200).json({success:true,message:"Order cancelled successfully ! "});
          }catch(err){
               console.log("Error : "+err);
           }
     },
     getOrderData: async (req,res) =>{
          try {
                 const  { id } = req.params;
                 const {user,userId} = req.session;
                 console.log("INside getOrder details !!!");
                 const [category,order,userData] = await Promise.all([
                    Category.find({catStatus:true}),
                    Order.findOne({'_id':id}).populate('items.product').populate('address').populate('coupon'),
                    User.findOne({_id:userId},{name:1,email:1,mobile:1})
                 ]);
                res.render('./shop/viewOrderDetails',{
                     order : order,
                     user:user,
                     category : category,
                     userData,
                     count : 0,
                 });
          }catch(err){
               console.log(err);
          }
     },
     // getFailurePage : async(req,res) => {
     //      try{
     //           const {user,userId} = req.session;
     //          const category = await Category.find({catStatus:true},'_id catName');
     //          const oid= await Order.find({user:userId})
     //          res.render('./shop/orderFailure',{
     //               category : category,
     //               user : user,
     //               count : 0,
     //          });
     //     }catch(err){
     //          console.log("Error occured::"+err);
     //     }
     //     },
     applyCoupon: async(req,res) =>{
       try{
           console.log("Inside apply coupon !");
           const { coupon,total }  = req.params;
           const {userId}= req.session;
           const cart = await Cart.findOne({userId});
           const isValid = await Order.find({user:{$elemMatch: {$eq: userId}}});
           console.log("Is user used the coupon :: "+isValid);
           if(!userId){
                res.status(400).json({error:true,message:"Cart not Found !! "});
           }
           let discount;
           console.log("Values :: "+coupon + total);
           const couponData = await Coupon.findOne({coupon});
           if(couponData.minimumAmount <= total){
                 discount = Math.ceil(total* couponData.percentage/100);
                 if(discount>couponData.maximumAmount){
                    discount = Math.round(couponData.maximumAmount);
                 }
                 let totalAmount = total-discount;
                 console.log("Total Amount :: Discount :: "+totalAmount,discount);
                 res.json({coupon:couponData._id,discountAmount:discount,total:totalAmount}); 
          }else{
               res.json({error:true,message:"You are not eligible to apply coupon !"});
          }
     }catch(err){
          console.log("Error occured :: "+err);
          res.status(500).json({error:true,message:"INternal server Error !! "});
     }
     },
     returnProduct : async(req,res) =>{
        try{   
           let user,amount;
           console.log("Return Product !!")
           const {id}= req.params;
           const doc = await Order.findOneAndUpdate({'_id':id},
              {$set: {status :"Return"}},
              {returnDocument:'after'}
           );
           if(doc){
               
                 user=doc.user;
                 amount = doc.amount;    
           }
          const updatePromises = doc.items.map(row => {
               return Product.updateOne(
                    {_id:row.product._id,'varient.size':row.size},
                    {$inc: {'varient.$.quantity':row.quantity}}
               );
          }) ;
          const results= await Promise.all(updatePromises);

           await Wallet.updateOne(
               { user: user },
               {
                 $inc: { balance: amount },
                 $push: { transactions: { amount: amount, status: 'Refund', type: 'credit' } }
               },
              );
        }catch(err){
            console.log(err);
        } 
     },
   changeStatus : async(req,res) => {
          try{
               console.log("Inside change Pay status");
               const {id} = req.params;
               await Order.updateOne({_id:id},
                    {$set:{payStatus:true,status:'Placed'}}
               );
             }catch(err){
               console.log('Error occured ::'+err);
          }
     }
}

   


