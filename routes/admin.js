const express = require('express');
const router = express.Router();
// const adminHelper=require("../helpers/adminhelper");
const admincontroller = require('../controllers/admincontrollers');
const upload = require('../utils/multer')
const middlware= require('../util/middleware');
const middleware = require('../util/middleware');

router.get('/', admincontroller.homepage)
router.get('/login', admincontroller.adminlogin)
router.post('/login',admincontroller.adminloginpost)
router.get("/logout",admincontroller.adminlogout)
router.get("/adminproductview",middlware.checkAdminLoggedIn,admincontroller.productpageget)
router.get("/productcategory",middlware.checkAdminLoggedIn,admincontroller.productcategory)
router.post("/addcategory",middlware.checkAdminLoggedIn,admincontroller.addcategory)
router.get("/addproduct",middlware.checkAdminLoggedIn,admincontroller.addproduct)
router.post("/addproduct", upload.array('image'),middlware.checkAdminLoggedIn,admincontroller.addproductpost)
router.get("/adminuserlist",middlware.checkAdminLoggedIn,admincontroller.adminuserlist)
router.get('/editproduct/:id',middlware.checkAdminLoggedIn,admincontroller.editproductget)
router.post('/editproduct/:id',upload.array('image'),middlware.checkAdminLoggedIn,admincontroller.editproductpost)
router.post('/editcategory',middlware.checkAdminLoggedIn,admincontroller.editcategorypost)
router.get('/listcategory/:id',middlware.checkAdminLoggedIn,admincontroller.listcategory);
router.get('/unlistcategory/:id',middlware.checkAdminLoggedIn,admincontroller.unlistcategory);
router.get('/listproduct/:id',middlware.checkAdminLoggedIn,admincontroller.listproduct)
router.get('/unlistproduct/:id',middlware.checkAdminLoggedIn,admincontroller.unlistproduct)
router.get('/blockuser/:id',middlware.checkAdminLoggedIn,admincontroller.blockuser)
router.get('/unblockuser/:id',middlware.checkAdminLoggedIn,admincontroller.unblockuser)
router.get('/orderlistview',middlware.checkAdminLoggedIn,admincontroller.orderlistrender)
router.post('/change-order-status',middlware.checkAdminLoggedIn,admincontroller.changeorderstatus)
router.get('/order-details/:id',middleware.checkAdminLoggedIn,admincontroller.ordersandusers)
router.get('/getcoupon',middleware.checkAdminLoggedIn,admincontroller.couponget)
router.post('/addcoupon',middleware.checkAdminLoggedIn,admincontroller.addcoupon)
router.post('/editcoupon/:id',middleware.checkAdminLoggedIn,admincontroller.editcouponpost)
router.get('/deletecoupon/:id',middleware.checkAdminLoggedIn,admincontroller.deletecoupon)
router.get('/bannerview',middleware.checkAdminLoggedIn,admincontroller.getbanners)
router.get('/addbanner',middleware.checkAdminLoggedIn,admincontroller.addbanner)
router.post('/addbanner',upload.single('image'),middleware.checkAdminLoggedIn,admincontroller.addbannerpost)
router.get('/listbanner/:id',middleware.checkAdminLoggedIn,admincontroller.listbanner)
router.get('/unlistbanner/:id',middleware.checkAdminLoggedIn,admincontroller.unlistbanner)
router.get('/deletebanner/:id',middleware.checkAdminLoggedIn,admincontroller.deletebanner)
router.post('/editaddress',middleware.checkUserLoggedIn)

module.exports = router;
