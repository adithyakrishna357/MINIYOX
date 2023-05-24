const express = require('express');
const router = express.Router();
// const UserHelper=require("../helpers/userhelper");
const usercontroller = require('../controllers/usercontrollers');
const middleware=require('../util/middleware')

/* GET users listing. */
router.get('/',usercontroller.homepagerender) 
router.get('/login',middleware.sessionHandle,usercontroller.loginrender)  
router.post('/login',usercontroller.loginpost)
router.get('/signup',middleware.sessionHandle,usercontroller.signuprender)
router.post("/signup",usercontroller.signuppost)
router.get("/logout",usercontroller.logoutget)
router.get('/view-products',middleware.checkUserLoggedIn,usercontroller.getviewproducts)
router.get('/singleproductview/:id',middleware.checkUserLoggedIn,usercontroller.singleproductview)
router.get('/otplogin',middleware.sessionHandle,usercontroller.getotplogin)
router.post('/sendOTP', usercontroller.sendotp);
router.post('/otpVerify', usercontroller.verifyotp);
router.post('/resendOTP', usercontroller.resendotp);
router.get('/cart',middleware.checkUserLoggedIn,usercontroller.getcart)
router.get('/addtocart/:id',middleware.checkUserLoggedIn,usercontroller.addcart);
router.get('/removeproducts/:id',middleware.checkUserLoggedIn,usercontroller.removeproductfromcart)
router.post('/change-cart-quality',usercontroller.changecartquality)
router.get('/checkoutpage',middleware.checkUserLoggedIn,usercontroller.getcheckoutpage)
router.post('/add-address',middleware.checkUserLoggedIn,usercontroller.addaddress)
router.post('/placeorder',middleware.checkUserLoggedIn,usercontroller.placeorder)
router.get('/order-success',middleware.checkUserLoggedIn,usercontroller.ordersuccessrender)
router.get('/userorder-list',middleware.checkUserLoggedIn,usercontroller.orderlistrender)
router.post('/cancel-order',middleware.checkUserLoggedIn,usercontroller.cancelorder)
router.get('/order-details/:id',middleware.checkUserLoggedIn,usercontroller.orderdetails)
router.get('/userprofile/:id',middleware.checkUserLoggedIn,usercontroller.getuserprofile)
router.post('/profileinformation/:id',middleware.checkUserLoggedIn,usercontroller.editprofileinfo)
router.get('/forgotpassword',middleware.sessionHandle,usercontroller.forgotgetotplogin)
router.post('/forgototpsendotp',usercontroller.forgotsendotp)
router.post('/forgototpVerify',usercontroller.forgotverifyotp);
router.post('/resetpassword/:id',usercontroller.resetpassword)
router.get('/changepassword',middleware.checkUserLoggedIn,usercontroller.changepassword)
router.post('/changepassword',middleware.checkUserLoggedIn,usercontroller.changepasswordpost)
router.post('/verify-payment',middleware.checkUserLoggedIn,usercontroller.verifypayment)
router.get('/manageaddress',middleware.checkUserLoggedIn,usercontroller.manageaddress)
router.post('/manageadd-address',middleware.checkUserLoggedIn,usercontroller.manageaddaddress)
router.post('/editaddress/:id',middleware.checkUserLoggedIn,usercontroller.editaddress)
router.get('/remove-address/:id',middleware.checkUserLoggedIn,usercontroller.removeaddress)
router.post('/search',usercontroller.search)
router.get('/addtowish/:id',middleware.checkUserLoggedIn,usercontroller.addtowish)
router.get('/wishlist',middleware.checkUserLoggedIn,usercontroller.wishlistdetails)
router.get('/removewhislistproduct/:id',usercontroller.removewishlistproduct)
router.post('/couponapply',middleware.checkUserLoggedIn,usercontroller.couponapply)
router.get('/wallet',middleware.checkUserLoggedIn,usercontroller.getwallet)



module.exports = router;
