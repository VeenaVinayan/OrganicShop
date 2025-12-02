const express= require('express');
const router = express.Router();

const shop = require('../controller/shopController');
const isAuth = require('../middlewares/isAuth');
const cart = require('../controller/cartController');
const order = require('../controller/orderController');
const search = require('../controller/searchController');
const wallet = require('../controller/walletController');
//const isBlock = require('../middlewares/isBlocked');

router.get('/',shop.getUserShop);
router.get('/productDetails/:id',shop.getProductDetails);
router.get('/userSignout',shop.signout);
router.get('/categorySearch/:id',shop.getCategoryProducts);
router.get('/organiclife',shop.viewGuestPage);
// cart operations 
router.post('/addToCart',isAuth.isUser,cart.addToCart);
router.get('/viewCart',isAuth.isUser,cart.viewCart);
router.patch('/removeCartItem',isAuth.isUser,cart.removeCartItem);
router.patch('/increaseCartQuantity',isAuth.isUser,cart.increaseCartQuantity);
router.patch('/decreaseCartQuantity',isAuth.isUser,cart.decreaseCartQuantity);
//checkOut -  order
router.post('/placeOrder',isAuth.isUser,order.placeOrder);
router.get('/checkOut/:id',isAuth.isUser,order.checkOutView);
router.patch('/cancelOrder/:id',isAuth.isUser,order.doCancelOrder);
router.get('/viewOrderDetails/:id',isAuth.isUser,order.getOrderData);
router.patch('/returnProduct/:id',isAuth.isUser,order.returnProduct);
router.patch('/changeStatus/:id',isAuth.isUser,order.changeStatus);
//User Profile
router.get('/userProfile',isAuth.isUser,shop.getUserProfile);
router.post('/address',isAuth.isUser,shop.saveAddress);
router.get('/editUserProfile',isAuth.isUser,shop.editUserProfile);
router.post('/saveEditProfile',isAuth.isUser,shop.saveEditProfile);
router.get('/editAddress/:id/:adId',isAuth.isUser,shop.editAddress);
router.post('/saveEditAddress',isAuth.isUser,shop.saveEditAddress);
router.get('/addAddress/:id',isAuth.isUser,shop.addAddressView);
router.get('/userOrder',isAuth.isUser,shop.userOrderView);
//advance Search
router.get('/advanceSearch',shop.advanceSearch);
router.post('/searchProduct',shop.searchProduct);
// Add to wishlist
router.post('/addToWishlist/:id',isAuth.isUser,shop.addToWishlist);
router.get('/wishlist',isAuth.isUser,shop.viewWishlist);
router.patch('/deleteWishlist/:id',isAuth.isUser,shop.deleteWishlist);
// Product Search
router.post('/productSearch',search.productSearch);
// Apply Coupon
router.get('/applyCoupon/:coupon/:total',isAuth.isUser,order.applyCoupon);
//Wallet management
router.get('/wallet',isAuth.isUser,wallet.viewWallet);
router.post('/rechargeWallet',isAuth.isUser,wallet.rechargeWallet);

module.exports =router;