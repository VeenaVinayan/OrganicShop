const Product = require('../models/product');
const Category = require('../models/category');
const Cart = require('../models/cart');
const { page } = require('pdfkit');
const PER_PAGE = 5;
module.exports = {
    productSearch : async (req,res) =>{
         const {search}= req.body;
         const {user,userId} = req.session;
         let page =Number(req.query.page);
         if(isNaN(page) || page<1){
            page=1;
         }
         const [  products,category,cartItems ] = await Promise.all([
            Product.find({productName: {$regex: search,$options:'i'}}),
            Category.find({catStatus:true}),
            Cart.findOne({user:userId})
         ]);
         const totalPages= products.count;
         console.log("Values on category ::"+category);
         const cartCount = cartItems?cartItems.items.length:0; 
         res.render('./shop/advanceSearch',{
                     user:user,
                     category:category,
                     product:products,
                     count : cartCount,
                     currentPage:page,
                     totalPages : Math.ceil(totalPages/PER_PAGE)
            });            
        }
    }

