const Coupon = require('../models/coupon');
const moment = require('moment');

module.exports={
   couponView : async(req,res) =>{
        console.log("Inside Coupon View !!");
        res.render('./admin/coupon');
     },
    saveCoupon: async(req,res) =>{
       try {
            console.log("Inside Add coupon!!");
            const {coupon,description,percentage,minimumAmount,maximumAmount,expiryDate} =req.body;
            if(coupon !="" && description !="" && percentage !=""){ 
            const newCoupon = new Coupon({
                    coupon,
                    description,
                    percentage,
                    minimumAmount,
                    maximumAmount,
                    expiryDate,
             });
             await newCoupon.save();
             req.flash('success',"Successfully added coupon !!");
             res.redirect('/couponList');
           }else{
               req.flash('error',"Error occured  !!");
               res.redirect('/couponList');
             }
             
          }catch(err){
            console.log(err);
       }
    },
    viewCouponList: async (req,res) => {
       const coupon= await Coupon.find().sort({_id:-1});
       res.render('./admin/couponList',{ 
               coupon
         });
    },
    deleteCoupon:async (req,res) =>{
    try{
        const {oid}=req.params;
        console.log("ID :: "+oid);
        await Coupon.updateOne({'_id':oid},
             {$set:{ isListed :false}});
       res.status(200).json({success:true,message:"Successfully UnList !"});
    }catch(err){
        console.log("Error occured :: "+err);
        res.status(500).json({error:true,message:"Error coccured !!"});
    }
  },
  listCoupon:async (req,res) => {
   try{
       console.log("Inside Unlist coupon");
       const {id}=req.params;
       const coupon = await Coupon.findOne({_id:id});
        coupon.isListed = !coupon.isListed;
       await coupon.save();
       res.status(200).json({success:true,message:"Successfully Listed !"});
   }catch(err){
      res.status(500).json({error:true,message:"Error coccured !!"});
   }
 },
  getEditCoupon: async (req,res) =>{
     console.log("Inside Edit Coupon....");
     try{
        const {id} = req.params;
        const coupon = await Coupon.findById(id);
        res.render("./admin/editCoupon",{coupon,moment});
    }catch(err){
       console.log("Error occured ::: "+err);
  }
 },
  saveEditCoupon : async (req,res) => {
     const {id,coupon,description,percentage,minimumAmount,maximumAmount,expiryDate} =req.body;
     if(id !="" && coupon != "" && description !="" && percentage != "" && maximumAmount != "" && minimumAmount !="" && expiryDate != ""){ 
      console.log("Inside Edit coupon with validated values |||");
      await Coupon.findOneAndUpdate({'_id':id},{
        $set:{ coupon:coupon,
               description:description,
               percentage:percentage,
               minimumAmount:minimumAmount,
               maximumAmount:maximumAmount,
               expiryDate:expiryDate,
         }    
     });
     req.flash('success',"Successfully Edit coupon !!")
     res.redirect('/couponList');
   // } else{
   //    console.log("Inside Error Edit coupon with validated values |||");
   //     req.flash('error','Validation Error !!');
   //     res.redirect('/couponList');
   }
  }
}