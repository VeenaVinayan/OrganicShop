
const { json } = require('body-parser');
const Cart = require('../models/cart');
const Category = require('../models/category');
const Product = require('../models/product');
module.exports ={
  addToCart : async (req,res) => {
  try{
       const {product,size,quantity } = req.query;
       const {userId,user } = req.session;
       const isUser = await Cart.findOne({user:userId});
         // alredy in cart
       if(isUser !== null){
            await Cart.updateOne({user:userId},{$push: {items: {product:product,size:size,quantity : quantity}}});
            res.status(200).json({
                 success: true,
                 message :'Product added to cart Successfully !',
                 newItem :true,
                 login : true,
            });
         }else{  // add to cart new item
         const newProduct = new Cart({
                       user : userId,
                       items :[{ product : product,size:size , quantity : quantity } ] 
                  });
        //To Get varient_id
        await newProduct.save();
        // Update stock of the corresponding product !!! 
       await Product.updateOne({'_id':product,'varient.size':size},
          {$inc : {'varient.$.quantity' : -1*quantity}},
         );
         res.status(200).json({
        success: true,
        message :'Successfully product added to cart !!',
       });
    }} catch(err){
         console.log(err);
   }
  },
   viewCart : async(req,res) => {
       const category =  await Category.find({catStatus:true});
       const cartItems = await Cart.findOne({user:req.session.userId}).populate('items.product');
      let cartCount;
       if(cartItems){
          cartCount = cartItems.items?cartItems.items.length:null; 
       }else{
          cartCount = 0;
       }
       
       res.render('./shop/cart',{
            category:category,
            user : req.session.user,
            count: cartCount,
            cart : cartItems,
        });
   },
   removeCartItem : async (req,res) =>{
     try {
       const { userId } = req.session ;
       let { id,size,quantity  } = req.query;
       const qty = parseInt(quantity);
       await Cart.updateOne({user:userId},
          { $pull : {items: {product:id}}
       });
       
       await Product.updateOne({'_id':id,'varient.size':size},
           {$inc: {'varient.$.quantity': qty}
       }); 
     res.status(200).json({success:true,message:"Item removed successfully !"});
     }catch(err){
        console.log("Error occured !! "+err);
     }
   },
   increaseCartQuantity: async (req,res) => {
     try {  
      const {product,size} = req.query;
      const {userId} = req.session;
      if(!product || !size || !userId){
         res.status(500).json({error:true,message:""});
      }
      const varient = await Product.findOne({_id:product,'varient.size':size},{'varient.$':1});
      const stock = varient.varient[0].quantity;
      if(stock >= 2){
         await  Cart.updateOne(
               {user:userId,'items.product':product,'items.size':size},
               {$inc: {'items.$.quantity' : 1}}),
         
         await Product.updateOne({'_id':product,'varient.size':size},
             {$inc : {'varient.$.quantity' : -1}},
            )
         value={
            discount:varient.varient[0].discount,
            price:varient.varient[0].price,
         }   
         res.status(200).json(value);
      }else{
         res.status(500).json({error:true,message:"Product Stock not avilable"});
      }
      }catch(err){
         console.log("Error occured ::"+err);
      } 
   },
   
   decreaseCartQuantity : async(req,res) => {
      try {
         const {product,size} = req.query;
         const {userId} = req.session;
         const varient = await Product.findOne({_id:product,'varient.size':size},{'varient.$':1});
         const stock = varient.varient[0].quantity;
            await  Cart.updateOne(
                  {user:userId,'items.product':product,'items.size':size},
                  {$inc: {'items.$.quantity' : -1}}),
            
            await Product.updateOne({'_id':product,'varient.size':size},
                {$inc : {'varient.$.quantity' : 1}},
               )
            value={
               discount:varient.varient[0].discount,
               price:varient.varient[0].price,
            }   
            res.status(200).json(value);
         
         }catch(err){
            console.log("Error occured ::"+err);
            res.status(500).json({error:true,message:"Error occured !"});
         } 
   }
}