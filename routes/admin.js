const express = require('express');
const router = express.Router();

const admincontroller = require('../controllers/admincontrollers');
const upload = require('../utils/multer')
const {checkAdminLoggedIn} = require('../util/middleware')

router.get('/', admincontroller.homepage)
router.get('/login', admincontroller.adminlogin)
router.post('/login',admincontroller.adminloginpost)
router.get("/logout",admincontroller.adminlogout)
router.get("/adminproductview", checkAdminLoggedIn,admincontroller.productpageget)
router.get("/productcategory",checkAdminLoggedIn,admincontroller.productcategory)
router.post("/addcategory",checkAdminLoggedIn,admincontroller.addcategory)
router.get("/addproduct",checkAdminLoggedIn,admincontroller.addproduct)
router.post("/addproduct", upload.array('image'),checkAdminLoggedIn,admincontroller.addproductpost)
router.get("/adminuserlist",checkAdminLoggedIn,admincontroller.adminuserlist)
router.get('/editproduct/:id',checkAdminLoggedIn,admincontroller.editproductget)
router.post('/editproduct/:id',upload.array('image'),checkAdminLoggedIn,admincontroller.editproductpost)
router.post('/editcategory',checkAdminLoggedIn,admincontroller.editcategorypost)
router.get('/listcategory/:id',checkAdminLoggedIn,admincontroller.listcategory);
router.get('/unlistcategory/:id',checkAdminLoggedIn,admincontroller.unlistcategory);
router.get('/listproduct/:id',checkAdminLoggedIn,admincontroller.listproduct)
router.get('/unlistproduct/:id',checkAdminLoggedIn,admincontroller.unlistproduct)
router.get('/blockuser/:id',checkAdminLoggedIn,admincontroller.blockuser)
router.get('/unblockuser/:id',checkAdminLoggedIn,admincontroller.unblockuser)
router.get('/orderlistview',checkAdminLoggedIn,admincontroller.orderlistrender)
router.post('/change-order-status',checkAdminLoggedIn,admincontroller.changeorderstatus)
router.get('/order-details/:id',checkAdminLoggedIn,admincontroller.ordersandusers)
router.get('/getcoupon',checkAdminLoggedIn,admincontroller.couponget)
router.post('/addcoupon',checkAdminLoggedIn,admincontroller.addcoupon)
router.post('/editcoupon/:id',checkAdminLoggedIn,admincontroller.editcouponpost)
router.get('/deletecoupon/:id',checkAdminLoggedIn,admincontroller.deletecoupon)
router.get('/bannerview',checkAdminLoggedIn,admincontroller.getbanners)
router.get('/addbanner',checkAdminLoggedIn,admincontroller.addbanner)
router.post('/addbanner',upload.single('image'),checkAdminLoggedIn,admincontroller.addbannerpost)
router.get('/listbanner/:id',checkAdminLoggedIn,admincontroller.listbanner)
router.get('/unlistbanner/:id',checkAdminLoggedIn,admincontroller.unlistbanner)
router.get('/deletebanner/:id',checkAdminLoggedIn,admincontroller.deletebanner)
router.get('/graphstatics',checkAdminLoggedIn,admincontroller.graphstatics)
router.get('/salesreport',checkAdminLoggedIn,admincontroller.salesreport)
router.get('/editbanner/:id',checkAdminLoggedIn,admincontroller.editbanner)
router.post('/editbanner/:id',upload.single('image'),checkAdminLoggedIn,admincontroller.editbannerpost)
router.post('/salesreportfilter',checkAdminLoggedIn,admincontroller.salesreportfiler)

module.exports = router;
