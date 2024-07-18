const User = require('../models/user');
const Category = require('../models/category');
const Order = require('../models/order');
const moment = require('moment');
//const alert = require('alert');
const PER_PAGE = 10;
module.exports = { 
// Admin Home
  adminUserView : async (req,res) => {
        try{
               let page = Number(req.query.page);
               if(isNaN(page) || page<1) {
                   page=1;
               }
               const[count,users ] = await Promise.all ([ 
                  User.countDocuments({isAdmin:false}),
                  User.find({isAdmin:false})
                    .skip((page-1)*PER_PAGE)
                    .limit(PER_PAGE)
               ]); 
               
               res.render("./admin/adminUserView",{
                   title:'Admin Home',
                   user:users,
                   currentPage : page,
                   hasNextPage : page * PER_PAGE < count,
                   hasPrevPage : page > 1,
                   index:(page-1)*PER_PAGE,
                   nextPage : page+1,
                   prevPage : page-1,
                   lastPage : Math.ceil(count / PER_PAGE),
              });
         }catch(err){
             console.error(err);
        }
    },
    adminUnblockUser : async(req,res) => {
      const {id} = req.query;
      try {
         const user = await User.findOne({'_id':id});   
         user.isBlock = !user.isBlock;
         await user.save();    
         redirect('/adminUserView');
    }catch(err){
        console.log("Error occured !!" +err);
    }
  }, 
  category : async (req,res) => {
     const list = await Category.find();
     if(list){
         res.render('./admin/categoryNew',{title:'Category',catList:list});
      }else{
           console.log("No Records found!!");
           res.render('./admin/categoryNew',{title:Category,error:"No Records found"});
      }
   },
   addCategory : async(req,res) =>{
      const name=req.body.catName.toUpperCase();
      const isExist = await Category.findOne({catName:name});
      if(isExist) {
         req.flash('error','Category exist!')
         res.redirect('/category');
      }else {
       const newCategory = new Category({
          catName : name,
      })
       await newCategory.save();
       res.redirect('/category');
    } 
    },
    
    unListCategory : async (req,res) => {
      try {
        const {id} = req.query;
        await Category.findByIdAndUpdate(id,{catStatus : false});
      }catch(err){
        console.error(err);   
      } 
    },
    listCategory : async (req,res) => {
        try {
          const {id} = req.query;
          await Category.findByIdAndUpdate(id,{catStatus : true});
        }catch(err){
          console.error(err);   
        } 
      },
    
    editCategoryView : async (req,res) => {
         const {id} = req.params;
         const category = await Category.findById(id)
         res.render('./admin/editCategory',{title:'Edit Category',category:category});
    },

    editCategory : async (req,res) =>{
         const {categoryId }=req.body;
         await Category.findByIdAndUpdate(categoryId,{catName : req.body.catName});
         res.redirect('/category');
    },
    viewCustomerOrders : async (req,res) => {
        try{
            let  page  = Number(req.query.page);
            if(page < 0 || isNaN(page)){
                  page =1;
             }
            const [ orders,orderCount ]= await Promise.all([
                   Order.find().populate('address').sort({date:-1})
                         .skip((page-1)*PER_PAGE)
                         .limit(PER_PAGE),
                   Order.find().count()
            ]);
           res.render('./admin/viewOrders',{
                 title:'Admin Order View',
                 admin : req.session.admin,
                 orders : orders,
                 currentPage : page,
                 hasNextPage : page * PER_PAGE < orderCount,
                 hasPrevPage : page > 1,
                 index: (page-1)*PER_PAGE,
                 nextPage : page + 1,
                 prevPage : page -1,
                 lastPage : Math.ceil( orderCount / PER_PAGE ),
                 moment : moment,
              });
        }catch(err){
           console.log(err);
        }
    },
    getOrderDetail : async (req,res) =>{
       try{
          const { id } = req.params;
          const order = await Order.findOne({'_id':id}).populate('items.product').populate('address');
          res.render('./admin/orderDetails',{
              order : order,
              admin : req.session.admin,
              moment : moment,
          })
       }catch(err){
          console.log(err);
       }
    },
    changeOrderStatus: async(req,res) =>{
    try { 
        const {status, oid }  = req.query;
        if(status === "Delivered"){
          await Order.updateOne({'_id':oid},{
            $set: {status : status, payStatus:true, deliveredDate : Date.now()}
          });
        }else{ 
           await Order.updateOne({'_id':oid},{
              $set: {status : status}
           });
       } 
        res.json({success:true,message:`Successfully update Status!`});
    }catch(err){
       console.log("Error occured " +err);
    }  
  },
}

