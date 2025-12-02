
const Category = require('../models/category');
const Product = require('../models/product');
const Cart = require('../models/cart');
const User = require('../models/user');
const Address = require('../models/address');
const Order = require('../models/order');
const Wishlist = require('../models/wishlist');
const moment =require('moment');
const PER_PAGE = 8;

module.exports = {
     getUserShop : async (req,res) => {
        let  page  = Number(req.query.page); 
    
        if(isNaN(page) || page<1) {
                    page=1;
          }
        const [category,cart,products,count] = await Promise.all([
               Category.find({catStatus:true},'_id catName'),
               Cart.findOne({user:req.session.userId}),
               Product.find({status:true},'productName varient image ')
                 .sort({productName:-1})
                 .skip((page-1)*PER_PAGE)
                 .limit(PER_PAGE),
               Product.countDocuments({status:true})
         ]);
         let cartCount = cart?cart.items.length:0;
         res.render("./shop/index",{
                    user:req.session.user,
                    category:category,
                    product:products,
                    count:cartCount,
                    moment:moment,
                    currentPage : page,
                    totalPages : Math.ceil(count / PER_PAGE),
               });       
     },
getProductDetails : async (req,res) => {
  try {   
    const { id } = req.params;
    const userId = req.session?.userId || null;
    const user = req.session?.user || null;

    const [product, category] = await Promise.all([
      Product.findOne({ _id: id }).populate('category'),
      Category.find()
    ]);

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ userId: userId });
    }

    let count = cart ? cart.items.length : 0;

    res.render('./shop/productDetails', {
      user: user,         
      product: product,
      category: category,
      count : count       
    });

     } catch (error) {
     console.log(error);
     res.status(500).send('Server Error');
     }
  },

     signout: async (req,res) => {
         req.session.user = null;
         res.redirect('/');
     },
    getCategoryProducts : async (req,res) => {
        try {
        const {id} = req.params;
        let { page } = req.query; 
         
        if(isNaN(page) || page<1) {
                    page=1;
          }
        const {user,userId} = req.session;
        const [products,category,cart] = await Promise.all([
             Product.find({category:id,status:true}),
             Category.find({catStatus:true},'_id catName'),
             Cart.findOne({_id:userId})
        ]) ;
        let count = cart?cart.items.length:0; 
        let totalPages=products.length;   
        res.render('./shop/advanceSearch',{
          user:user,
          category : category,
          product:products,
          count:count,
          currentPage:page,
          totalPages:Math.ceil(totalPages/PER_PAGE),
       });
       }catch(err){
            console.log(err);
        }
     },
     viewGuestPage : async (req,res) =>{
       try {    
        const {user,userId} =req.session;  
        const [products,category,cart] = await Promise.all([
               Product.find().populate('category'),
               Category.find({catStatus:true},'_id catName'),
               Cart.findOne({user:userId}) 
         ]);
        let count = cart?cart.items.length:0; 
        user='guest';
        res.render('./shop/index',{
                    user:user,
                    category:category,
                    count:count,
                    product:products});
       }catch(err){
          console.log("Error occurd:: "+err);
       }            
     },
    advanceSearch : async (req,res) => {
     try {       
          const {user,userId} = req.session;
          let page= Number(req.query.page);
          if(isNaN(page) || page<1){
               page=1;
          }
          const[products,category,cart,totalCount] = await Promise.all([ 
               Product.find({status:true}).populate('category').skip((page-1)*PER_PAGE).limit(PER_PAGE),
               Category.find({catStatus:true},'_id catName'),
               Cart.findOne({user:userId}),
               Product.countDocuments({status:true})
          ]);
          let count = cart?cart.items.length:0; 
          
          res.render('./shop/advanceSearch',{
               user:user,
               category : category,
               product:products,
               count:count,
               currentPage : page,
               totalPages:Math.ceil(totalCount/PER_PAGE),
       });
     }catch(err){
          console.log("Error occured ::"+err);
     }
     },
     searchProduct : async (req,res) => {
          let page= Number(req.query.page);
          if(isNaN(page) || page<1){
               page=1;
          }
          const  { categoryId,sortType }= req.body;
          const {userId,user} = req.session; 
          minRange=parseInt(req.body.minRange);
          maxRange=parseInt(req.body.maxRange);
          const type = parseInt(sortType,10);
                   
          const [ category,products,cartItems,totalCount]= await Promise.all([
               Category.find({catStatus:true},'_id catName'),
               Product.find({category:categoryId,'varient.price':{$lt:maxRange,$gt: minRange}}).sort({productName:type}),
               Cart.findOne({user:userId}), 
               Product.countDocuments()
          ]);
          let cartCount = cartItems?cartItems.items.length:0;   
          
          res.render('./shop/advanceSearch',{
               user:user,
               category : category,
               product:products,
               count:cartCount,
               currentPage : page,
               totalPages:Math.ceil(totalCount/PER_PAGE)
       });
     },
     getUserProfile : async (req,res) =>{
          const {user,userId} = req.session;

          const [  category,userData,address,cart ] = await Promise.all([
               Category.find({catStatus:true},'_id catName'),
               User.findOne({email:user},{name:1,email:1,mobile:1}),
               Address.find({'userId':userId}),
               Cart.findOne({'user':userId})
            ]) 
          const cartCount = cart? cart.items.length : 0 ;
          res.render('./shop/userProfile',{
               user:req.session.user,
               currentRoute:req.url,
               category : category,
               userData : userData,
               address:address,
               count:cartCount,
          });
     },
     saveAddress : async(req,res) => {
     try {
          console.log(req.body);
          const{firstName,lastName,mobile,house,landMark,street,place,city,pincode,state,country,type,userId} = req.body;
          const address = new Address({
              firstName : firstName,
              lastName : lastName,
              mobile : mobile,
              house : house,
              landMark : landMark,
              street : street,
              place: place,
              city : city,
              pincode : pincode,
              state : state,
              country : country,
              type : type,
              userId : userId, 
          });
          await address.save();
          res.redirect('/userProfile');
      }catch(err){
           console.log(err);
      } 
     },
     editUserProfile: async (req,res) =>{
      try {
          const {userId} = req.session;
          const [category,userData,cart ] =await Promise.all([
                Category.find({catStatus:true},'_id catName'),
                User.findOne({'_id':userId},{name:1,email:1,mobile:1}),
                Cart.findOne({user:userId})
          ]);
          let cartCount = cart?cart.items.length:0; 
          res.render('./shop/editProfile',{
               user:req.session.user,
               currentRoute:req.url,
               category : category,
               userData : userData,
               count: cartCount,
          })
     }catch(err){
          console.log('Error !! ');
     }
 },
 saveEditProfile : async(req,res) => {
     try {
          const {id,fullName,phone} = req.body;
          await User.updateOne({'_id':id},
             {$set: {name : fullName,mobile : phone} 
          });
          req.flash('success','Successfully Update Profile!!')
          res.redirect('/userProfile');     
      }catch(err){
       console.log(err);
      }  
   },
 editAddress : async (req,res) => {
     try{
          const {id,adId} = req.params;
          const {user} = req.session;
          const [category,address,cart]= await Promise.all([
               Category.find({catStatus:true},'_id catName'),
               Address.findOne({'_id':adId}),  
               Cart.findOne({user:id})  
          ]) 
          let cartCount = cart ? cart.items.length : 0;
          res.render('./shop/editAddress',{
                  user : user,
                  category : category,
                  address : address,   
                  count : cartCount,   
          });
      }catch(err){
          console.log(err);
      }
 },
 saveEditAddress : async (req,res) => {
      try {
           console.log(req.body);
           await Address.updateOne({'_id':req.body.addId},{$set: {
               firstName : req.body.fname,
               lastName:req.body.lname,
               mobile: req.body.phone,
               house: req.body.house,
               landMark : req.body.landMark,
               street : req.body.street,
               place: req.body.place,
               city : req.body.city,
               pincode:req.body.pincode,
               state : req.body.state,
               country : req.body.country,
               type :req.body.type,
               userId : req.body.userId, 
           }});
          req.flash('success',"Successfully Edit Address !");
          res.redirect('/userProfile');
      }catch(err){
          console.log(err);
      }
 },
  addAddressView: async (req,res) =>{
     res.render('./shop/addAddress');
  },
  userOrderView : async (req,res) =>{
      let page= Number(req.query.page);
      if(isNaN(page) || page<1) {
          page=1;
      }
      const [count,orders,category ] = await Promise.all([
          Order.countDocuments({user:req.session.userId}),
          Order.find({user:req.session.userId}).sort({date:-1})
          .skip((page-1)*PER_PAGE)
          .limit(PER_PAGE),
          Category.find({catStatus:true},'_id catName')
        ]);
       
      res.render("./shop/userOrder",{
          user:req.session.user,
          category:category,
          order:orders,
          count:1,
          moment:moment,
          currentPage : page,
          hasNextPage : page * PER_PAGE <  count,
          hasPrevPage : page > 1,
          index:(page-1)*PER_PAGE,
          nextPage : page+1,
          prevPage : page-1,
          lastPage : Math.ceil(count / PER_PAGE),
     }); 
  },
  addToWishlist : async(req,res) => {
    try {
      const {id} = req.params;
      const {userId} = req.session;
      const isList = await Wishlist.findOne({user:userId});
      let isProductInList;
      if(isList){
           console.log("Inside item already Exists !!! ");
           await Wishlist.updateOne({user:userId},
                   {$push: {items :{product:id}}}    
               );
               res.status(200).json({success:true,message:"Successfully Added To wishlist !"}); 
      }else{
          console.log("Inside item Not Exists !!! ");
          const wishlist = new Wishlist({
               user : req.session.userId,
               items : [{product:id}],
         });
         await wishlist.save();
         res.status(200).json({success:true,message:"Successfully Added To wishlist !"});
       } 
     }catch(err){
        console.log("Error Occured !"+err);
        res.status(500).json({error:true,message:err});
     } 
  },
  viewWishlist : async (req,res) =>{
      const wishlist = await Wishlist.findOne({user:req.session.userId}).populate('items.product').sort({date:-1});
      const category = await Category.find({catStatus:true},'_id catName');
      res.render('./shop/wishlist',{
          category:category,
          user:req.session.user,
          list:wishlist,
          count:0,
       });
     },
     deleteWishlist : async(req,res) =>{
      try { 
           const {id}=req.params;
           const {userId} =req.session;
           await Wishlist.updateOne({user:userId},
                {$pull:{items: {product :id}}}   
            );
            const list = Wishlist.findOne({user:userId});
            console.log("List ::"+list);
            res.status(200).json({success:true,message:"Successfully deleted from Wishlist !"});
         }catch(err){
            console.log(err);
            res.status(500).json({eroor:true,message:"Deletion failure ! "});
         }   
     }
}
