const User = require('../models/user');
const Category = require('../models/category');
const Order = require('../models/order');
const moment = require('moment');
const PER_PAGE = 10;
const { ADMIN } = require('../constants/routes');
module.exports = { 

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
               
               res.render(ADMIN.ADMIN_USER_VIEW,{
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
         redirect(ADMIN.ADMIN_USER_VIEW);
    }catch(err){
        console.log("Error occured !!" +err);
    }
  }, 
  category : async (req,res) => {
     const list = await Category.find();
     if(list){
         res.render(ADMIN.CATEGORY_NEW,{title:'Category',catList:list});
      }else{
           console.log("No Records found!!");
           res.render(ADMIN.CATEGORY_NEW,{title:Category,error:"No Records found"});
      }
   },
   addCategory : async(req,res) =>{
    try {
      const name=req.body.catName.toUpperCase();
      const isExist = await Category.findOne({catName:name});
      if(isExist) {
         req.flash('error','Category exist!')
         res.redirect(ADMIN.CATEGORY);
      }else {
       const newCategory = new Category({
          catName : name,
      })
       await newCategory.save();
       res.redirect(ADMIN.CATEGORY);
    } 
    }catch(err){
       console.log("Error occured ::"+err);
    } 
    },
    
    unListCategory : async (req,res) => {
      try {
        const {id} = req.query;
        await Category.findByIdAndUpdate(id,{catStatus : false});
        await Product.updateMany({category:id},
          {  $set:{
                status:false
           }}
        )
      }catch(err){
        console.error(err);   
      } 
    },
    listCategory : async (req,res) => {
        try {
          const {id} = req.query;
          await Category.findByIdAndUpdate(id,{catStatus : true});
          await Product.updateMany({category:id},
            {  $set:{
                  status:true
             }}
          )
        }catch(err){
          console.error(err);   
        } 
      },
    
    editCategoryView : async (req,res) => {
         const {id} = req.params;
         const category = await Category.findById(id)
         res.render(ADMIN.EDIT_CATEGORY,{title:'Edit Category',category:category});
    },

    editCategory : async (req,res) =>{
         const {categoryId }=req.body;
         await Category.findByIdAndUpdate(categoryId,{catName : req.body.catName});
         res.redirect(ADMIN.CATEGORY);
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
           res.render(ADMIN.VIEW_ORDERS,{
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
          res.render(ADMIN.ORDER_DETAILS,{
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

function display(){
     console.log("New featur");
}