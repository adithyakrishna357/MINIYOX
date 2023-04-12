const express = require('express');
const router = express.Router();
const adminHelper=require("../helpers/adminhelper");
const admincontroller = require('../controllers/admincontrollers');
const upload = require('../utils/multer')
const middlware= require('../util/middleware');

router.get('/', admincontroller.homePage)
router.get('/login', admincontroller.adminLogin)
router.post('/login',admincontroller.adminLoginpost)
router.get("/logout",admincontroller.adminLogout)
router.get("/adminproductview",middlware.checkAdminLoggedIn,admincontroller.productpageget)
router.get("/productcategory",middlware.checkAdminLoggedIn,admincontroller.productcategory)
router.post("/addcategory",middlware.checkAdminLoggedIn,admincontroller.addcategory)
router.get("/addproduct",middlware.checkAdminLoggedIn,admincontroller.addproduct)
router.post("/addproduct", upload.array('image'),middlware.checkAdminLoggedIn,admincontroller.addproductpost)
router.get("/adminuserlist",middlware.checkAdminLoggedIn,admincontroller.adminuserlist)
router.get('/editproduct/:id',middlware.checkAdminLoggedIn,admincontroller.EditproductGet)
router.post('/editproduct/:id',upload.array('image'),middlware.checkAdminLoggedIn,admincontroller.EditproductPOst)
// router.get('/editcategory/:id',middlware.checkAdminLoggedIn,admincontroller.editcategoryGet)
router.post('/editcategory/:id',middlware.checkAdminLoggedIn,admincontroller.editcategoryPost)
router.get('/listcategory/:id',middlware.checkAdminLoggedIn,admincontroller.listcategory);
router.get('/unlistcategory/:id',middlware.checkAdminLoggedIn,admincontroller.unlistcategory);
router.get('/listproduct/:id',middlware.checkAdminLoggedIn,admincontroller.listproduct)
router.get('/unlistproduct/:id',middlware.checkAdminLoggedIn,admincontroller.unlistproduct)
router.get('/blockuser/:id',middlware.checkAdminLoggedIn,admincontroller.blockuser)
router.get('/unblockuser/:id',middlware.checkAdminLoggedIn,admincontroller.unblockuser)

module.exports = router;
