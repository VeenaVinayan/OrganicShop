const express = require('express');
const router = express.Router();
const uploadImage = require('../middlewares/multer');
const  admin = require('../controller/adminController');
const isAuth = require('../middlewares/isAuth');
const product = require('../controller/productController');
const coupon = require('../controller/couponController');
const report = require('../controller/salesReportController');
const {newProductValidate} = require('../middlewares/validation');
const {productSchema} = require('../schemaValidation/schema');


router.get('/adminHome',isAuth.isAdmin,report.adminHome);
// Block & Unblock user .
router.get('/adminUserView',isAuth.isAdmin,admin.adminUserView);
router.patch('/blockUser',isAuth.isAdmin,admin.adminUnblockUser);
router.patch('/unBlockuser',isAuth.isAdmin,admin.adminUnblockUser);
// Category 
router.get('/category',isAuth.isAdmin,admin.category);
router.post('/addCategorySubmit',isAuth.isAdmin,admin.addCategory);
router.get('/editCategory/:id',isAuth.isAdmin,admin.editCategoryView);
router.post('/editCategorySubmit',isAuth.isAdmin,admin.editCategory)
router.patch('/unListCategory',isAuth.isAdmin,admin.unListCategory);
router.patch('/listCategory',isAuth.isAdmin,admin.listCategory);
//Products
router.get('/product',isAuth.isAdmin,product.adminProductView);
router.get('/addProductView',isAuth.isAdmin,product.addProductView);
router.post('/addProduct',isAuth.isAdmin,uploadImage.array('image',4),product.addProduct);
router.get('/editProduct/:id',isAuth.isAdmin,product.editProductView);
router.patch('/listProduct',isAuth.isAdmin,product.listProduct);
router.patch('/unlistProduct',isAuth.isAdmin,product.unlistProduct);
router.post('/editProductSubmit',isAuth.isAdmin,uploadImage.array('image',4),product.editProduct);
//customer Order
router.get('/viewCustomerOrder',isAuth.isAdmin,admin.viewCustomerOrders);
router.get('/viewOrderDetail/:id',isAuth.isAdmin,admin.getOrderDetail);
router.patch('/changeStatus',isAuth.isAdmin,admin.changeOrderStatus);
//Coupon Management
router.get('/coupon',isAuth.isAdmin,coupon.couponView);
router.post('/saveCoupon',isAuth.isAdmin,coupon.saveCoupon);
router.get('/couponlist',isAuth.isAdmin,coupon.viewCouponList);
router.patch('/doCouponList/:id',isAuth.isAdmin,coupon.listCoupon);
router.get('/editCoupon/:id',isAuth.isAdmin,coupon.getEditCoupon);
router.post('/saveEditCoupon',isAuth.isAdmin,coupon.saveEditCoupon);
//Sales Report
router.get('/salesReport',isAuth.isAdmin,report.viewSalesReport);
router.get('/generateReport/:type/:from/:to',isAuth.isAdmin,report.getReport);
router.get('/generatePdf',isAuth.isAdmin,report.generatePdf);


module.exports = router;