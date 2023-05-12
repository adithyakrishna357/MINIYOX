const { response } = require('express');
const userhelper = require('../helpers/userhelper');
const { router } = require('../app');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

let message

module.exports = {
    SignUppost: (req, res) => {
        userhelper.doSigUp(req.body).then((response) => {
            req.session.userId = response._id;
            console.log(req.session.user_id);
            req.session.loggedIn = true;
            req.session.user = response;
            req.session.user.name = response.name;
            res.redirect('/');
        })
    },
    Loginrender: (req, res) => {
        if (req.session.loggedIn) {
            res.redirect('/');
        }
        else {
            res.render('user/userLogin', { user: true, userHeader: false, message });
            message = ''
        }

    },


    Loginpost: (req, res) => {
        userhelper.doLogin(req.body).then((response) => {
            if (response.status) {
                if (response.user.isblocked) {
                    message = 'user blocked !!!'
                    res.redirect('/login');
                } else {
                    req.session.loggedIn = true;
                    req.session.user = response.user
                    res.redirect('/');
                }
            }
            else {
                message = 'invalid Email Or Password'
                res.redirect('/login')
            }
        })
    },
    Logoutget: (req, res) => {
        // console.log("logout");
        req.session.user = false;
        req.session.loggedIn = false;
        res.redirect('/');
    },
    HomePagerender: (req, res) => {
        let user = req.session.user
        console.log(user);
        res.render('user/index', { userHeader: true, user })
    },
    SignUprender: (req, res) => {
        res.render('user/userSignup', { user: true, userHeader: false });
    },
    GetViewProducts: (req, res) => {
        // req.session.loggedIn=true;
        let user = req.session.user

        userhelper.viewProducts().then((products) => {
            console.log("this is product user side---", products.length);
            res.render('user/view-products', { user, products, userHeader: true });
        })
    },
    singleproductview: (req, res) => {
        // req.session.loggedIn=true;
        let user = req.session.user
        userhelper.SinglrProductView(req.params.id).then((productdetails) => {
            res.render('user/singleproductview', { user, productdetails, userHeader: true })
        })
    },
    Getotplogin: (req, res) => {
        // req.session.loggedIn=false;
        if (req.session.loggedIn) {
            res.redirect('/');
        }
        else {
            res.render('user/userotpLogin', { user: true, userHeader: false, message });
            // message=''
        }

    },
    sendOtp: (req, res) => {
        console.log(req.body);
        userhelper.otpnosend(req.body.mobile).then((response) => {
            if (response.status) {
                if (!response.isBlocked) {
                    req.session.user = response.user.name;
                    req.session.userdetails = response.user;
                    req.session.loggedIn=true;
                    client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                        .verifications
                        .create({ to: `+91${req.body.mobile}`, channel: 'sms' })
                        .then((verification) => {
                            console.log(verification.status);
                            res.render('user/userotpverification', { user: true, userHeader: false, mobile: req.body.mobile });
                        })
                        .catch((err) => console.log(err));
                }
                else {
                    message = "Your account is blocked";
                    res.redirect('/otplogin');
                }
            }
            else {
                message = "Mobile Number is not registered";
                res.redirect('/otplogin')
            }

        })

    },
    verifyOtp: (req, res) => {
        console.log(req.body);
        try {
            client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                .verificationChecks
                .create({ to: `+91${req.body.mobile}`, code: `${req.body.otp}` })
                .then((verification_check) => {
                    console.log(verification_check.status);
                    let mobile = req.body.mobile;
                    if (verification_check.valid) {
                        userhelper.otpnosend(mobile).then((response) => {
                            req.session.user = response.user;
                            console.log(response);
                            // req.session.loggedIn = true;
                            // console.log(verification_check.valid);
                            res.redirect('/')
                        })
                    }
                    else {

                        res.render('user/userotpverification', { user: true, mobile, status: true })
                    }
                })
        } catch (err) {
            console.log(err);
            res.render('user/userOtpverification', { user: true, mobile, status: true });
        }
    },
    getcart:(req,res)=>{
        res.render('user/shoppingcart',{user:true,userHeader:true})
    },
    addcart:(req,res)=>{
        // console.log(req.session.user._id);
        userhelper.AddCart(req.params.id,req.session.user._id).then(()=>{
            res.json({
                status:"success",
                message: "product added to cart"
              })
        })
    }
}
