const express = require('express');
const router = express.Router();
// const UserHelper=require("../helpers/userhelper");
const usercontroller = require('../controllers/usercontrollers');
const middleware=require('../util/middleware')

/* GET users listing. */
router.get('/',usercontroller.HomePagerender) 
router.get('/login',middleware.sessionHandle,usercontroller.Loginrender)  
router.post('/login',usercontroller.Loginpost)
router.get('/signup',middleware.sessionHandle,usercontroller.SignUprender)
router.post("/signup",usercontroller.SignUppost)
router.get("/logout",usercontroller.Logoutget)
router.get('/view-products',middleware.checkUserLoggedIn,usercontroller.GetViewProducts)
router.get('/singleproductview/:id',middleware.checkUserLoggedIn,usercontroller.singleproductview)

module.exports = router;
