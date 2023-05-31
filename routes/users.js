const express = require('express');
const router = express.Router();
// const UserHelper=require("../helpers/userhelper");
const usercontroller = require('../controllers/usercontrollers');
const {sessionHandle} = require('../util/middleware')
const {checkUserLoggedIn} = require('../util/middleware')

/* GET users listing. */
router.get('/',usercontroller.homepagerender) 
router.get('/login',sessionHandle,usercontroller.loginrender)  
router.post('/login',usercontroller.loginpost)
router.get('/signup',sessionHandle,usercontroller.signuprender)
router.post("/signup",usercontroller.signuppost)
router.get("/logout",usercontroller.logoutget)
router.get('/view-products',checkUserLoggedIn,usercontroller.getviewproducts)
router.get('/singleproductview/:id',checkUserLoggedIn,usercontroller.singleproductview)
router.get('/otplogin',sessionHandle,usercontroller.getotplogin)
router.post('/sendOTP', usercontroller.sendotp);
router.post('/otpVerify', usercontroller.verifyotp);
router.post('/resendOTP', usercontroller.resendotp);
router.get('/cart',checkUserLoggedIn,usercontroller.getcart)
router.get('/addtocart/:id',checkUserLoggedIn,usercontroller.addcart);
router.get('/removeproducts/:id',checkUserLoggedIn,usercontroller.removeproductfromcart)
router.post('/change-cart-quality',usercontroller.changecartquality)
router.get('/checkoutpage',checkUserLoggedIn,usercontroller.getcheckoutpage)
router.post('/add-address',checkUserLoggedIn,usercontroller.addaddress)
router.post('/placeorder',checkUserLoggedIn,usercontroller.placeorder)
router.get('/order-success',checkUserLoggedIn,usercontroller.ordersuccessrender)
router.get('/userorder-list',checkUserLoggedIn,usercontroller.orderlistrender)
router.post('/cancel-order',checkUserLoggedIn,usercontroller.cancelorder)
router.get('/order-details/:id',checkUserLoggedIn,usercontroller.orderdetails)
router.get('/userprofile/:id',checkUserLoggedIn,usercontroller.getuserprofile)
router.post('/profileinformation/:id',checkUserLoggedIn,usercontroller.editprofileinfo)
router.get('/forgotpassword',sessionHandle,usercontroller.forgotgetotplogin)
router.post('/forgototpsendotp',usercontroller.forgotsendotp)
router.post('/forgototpVerify',usercontroller.forgotverifyotp);
router.post('/resetpassword/:id',usercontroller.resetpassword)
router.get('/changepassword',checkUserLoggedIn,usercontroller.changepassword)
router.post('/changepassword',checkUserLoggedIn,usercontroller.changepasswordpost)
router.post('/verify-payment',checkUserLoggedIn,usercontroller.verifypayment)
router.get('/manageaddress',checkUserLoggedIn,usercontroller.manageaddress)
router.post('/manageadd-address',checkUserLoggedIn,usercontroller.manageaddaddress)
router.post('/editaddress/:id',checkUserLoggedIn,usercontroller.editaddress)
router.get('/remove-address/:id',checkUserLoggedIn,usercontroller.removeaddress)
router.post('/search',checkUserLoggedIn,usercontroller.search)
router.get('/addtowish/:id',checkUserLoggedIn,usercontroller.addtowish)
router.get('/wishlist',checkUserLoggedIn,usercontroller.wishlistdetails)
router.get('/removewhislistproduct/:id',checkUserLoggedIn,usercontroller.removewishlistproduct)
router.post('/couponapply',checkUserLoggedIn,usercontroller.couponapply)
router.get('/wallet',checkUserLoggedIn,usercontroller.getwallet)
router.get('/wallet-transcation',checkUserLoggedIn,usercontroller.wallettranscations)

module.exports = router;
