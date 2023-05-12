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
// router.get('/editcategory/:id',middlware.checkAdminLoggedIn,admincontroller.editcategoryGet)
router.post('/editcategory/:id',middlware.checkAdminLoggedIn,admincontroller.editcategorypost)
router.get('/listcategory/:id',middlware.checkAdminLoggedIn,admincontroller.listcategory);
router.get('/unlistcategory/:id',middlware.checkAdminLoggedIn,admincontroller.unlistcategory);
router.get('/listproduct/:id',middlware.checkAdminLoggedIn,admincontroller.listproduct)
router.get('/unlistproduct/:id',middlware.checkAdminLoggedIn,admincontroller.unlistproduct)
router.get('/blockuser/:id',middlware.checkAdminLoggedIn,admincontroller.blockuser)
router.get('/unblockuser/:id',middlware.checkAdminLoggedIn,admincontroller.unblockuser)
router.get('/orderlistview',middlware.checkAdminLoggedIn,admincontroller.orderlistrender)
router.post('/change-order-status',middlware.checkAdminLoggedIn,admincontroller.changeorderstatus)
router.get('/order-details/:id',middleware.checkAdminLoggedIn,admincontroller.ordersandusers)

module.exports = router;
