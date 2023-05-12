const { response } = require('express');
const userhelper = require('../helpers/userhelper');
const producthelper = require('../helpers/producthelper');
const razorpay = require('../utils/razorpay');
const ObjectId = require('mongodb-legacy').ObjectId
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

let message
let Message

module.exports = {
    signuppost: (req, res) => {
        userhelper.DoSigUp(req.body).then((response) => {
            req.session.userId = response._id;
            console.log(req.session.user_id);
            req.session.loggedIn = true;
            req.session.user = response;
            req.session.user.name = response.name;
            res.redirect('/');
        })
    },
    loginrender: (req, res) => {
        if (req.session.loggedIn) {
            res.redirect('/');
        }
        else {
            res.render('user/userLogin', { user: true, userHeader: false, message });
            message = ''
        }

    },


    loginpost: (req, res) => {
        userhelper.DoLogin(req.body).then((response) => {
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
    logoutget: (req, res) => {
        // console.log("logout");
        req.session.user = false;
        req.session.loggedIn = false;
        res.redirect('/');
    },
    homepagerender: async (req, res) => {
        let user = req.session.user
        console.log(user);
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        res.render('user/index', { userHeader: true, user, cartcount })
    },
    signuprender: (req, res) => {
        res.render('user/userSignup', { user: true, userHeader: false });
    },
    getviewproducts: async (req, res) => {
        // req.session.loggedIn=true;
        let user = req.session.user
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }

        producthelper.ViewProducts().then((products) => {
            console.log("this is product user side---", products.length);
            producthelper.GetProductCategory().then((categories) => {
                res.render('user/view-products', { user, cartcount, categories, products, userHeader: true });
            })
        })
    },
    singleproductview: async (req, res) => {
        // req.session.loggedIn=true;
        let user = req.session.user
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        producthelper.SingleProductView(req.params.id).then((productdetails) => {
            res.render('user/singleproductview', { user, cartcount, productdetails, userHeader: true })
        })
    },
    getotplogin: (req, res) => {
        // req.session.loggedIn=false;
        if (req.session.loggedIn) {
            res.redirect('/');
        }
        else {
            res.render('user/userotpLogin', { Message });
            // message=''
        }

    },
    sendotp: (req, res) => {
        // console.log(req.body);
        userhelper.OtpNoSend(req.body.mobile).then((response) => {
            if (response.status) {
                if (!response.isBlocked) {
                    // req.session.user = response.user.name;
                    // req.session.userdetails = response.user;
                    // req.session.loggedIn = true;
                    client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                        .verifications
                        .create({ to: `+91${req.body.mobile}`, channel: 'sms' })
                        .then((verification) => {
                            // console.log(verification.status);
                            Message = ""
                            res.render('user/userotpverification', { Message, mobile: req.body.mobile });
                        })
                        .catch((err) => console.log(err));
                }
                else {
                    Message = "Your account is blocked";
                    res.redirect('/otplogin');
                }
            }
            else {
                Message = "Mobile Number is not registered";
                res.redirect('/otplogin')
            }

        })

    },
    resendotp: (req, res) => {
        // console.log(req.body);
        userhelper.OtpNoSend(req.body.mobile).then((response) => {
            if (response.status) {
                if (!response.isBlocked) {
                    // req.session.user = response.user.name;
                    // req.session.userdetails = response.user;
                    // req.session.loggedIn = true;
                    client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                        .verifications
                        .create({ to: `+91${req.body.mobile}`, channel: 'sms' })
                        .then((verification) => {
                            // console.log(verification.status);
                            Message = ""
                            res.redirect('/otpVerify?mobile=' + encodeURIComponent(req.body.mobile));
                        })
                        .catch((err) => console.log(err));
                }
                else {
                    Message = "Your account is blocked";
                    res.redirect('/otplogin');
                }
            }
            else {
                Message = "Mobile Number is not registered";
                res.redirect('/otplogin')
            }

        })

    },

    verifyotp: (req, res) => {
        console.log(req.body);
        try {
            client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                .verificationChecks
                .create({ to: `+91${req.body.mobile}`, code: `${req.body.otp}` })
                .then((verification_check) => {
                    console.log(verification_check.status);
                    let mobile = req.body.mobile;
                    if (verification_check.valid) {
                        userhelper.OtpNoSend(mobile).then((response) => {
                            req.session.user = response.user;
                            console.log(response.user, 'i');
                            req.session.loggedIn = true;
                            // console.log(verification_check.valid);
                            res.redirect('/')
                        })
                    }
                    else {
                        Message = "Invalid OTP !!"
                        res.redirect('/sendOTP?mobile=' + encodeURIComponent(req.body.mobile));
                    }
                })
        } catch (err) {
            console.log(err);
            res.redirect('/sendOTP?mobile=' + encodeURIComponent(req.body.mobile));
        }
    },
    getcart: async (req, res) => {
        let user = req.session.user
        let products = await userhelper.GetCart(req.session.user._id)
        // console.log(products,"yugdo8ygwctgwct7edf8ydgvcybhv");
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        let totalprice = 0;
        for (var i = 0; i < products.length; i++) {
            totalprice = totalprice + products[i].subTotal
            products[i].productsDetails.product_price = products[i].productsDetails.product_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            products[i].subTotal = products[i].subTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        }
        totalprice = totalprice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        res.render('user/shoppingcart', { user, userHeader: true, cartcount, products, totalprice })


    },


    addcart: (req, res) => {
        // console.log(req.session.user._id);
        // console.log("api call............");
        userhelper.AddCart(req.params.id, req.session.user._id).then(async () => {
            cartcount = await userhelper.GetCartCount(req.session.user._id);
            // res.redirect('back')
            res.json({
                status: true,
                cartCount: cartcount
            })
        })
    },
    removeproductfromcart: (req, res) => {
        userhelper.CartRemoveProduct(req.session.user._id, req.params.id).then(() => {
            res.json({ status: true })
        })
    },
    changecartquality: (req, res) => {
        let userId = req.session.user._id
        // console.log(userId);
        userhelper.ChangeCartQuantity(req.body, userId).then((response) => {
            // console.log(response);
            if (response.modifiedCount === 1) {
                res.json({
                    status: 'removed',
                    message: "it removed"
                })
            }
            else {
                res.json({
                    status: 'changed',
                    message: "product quantity changed"
                })
            }
        })
    },
    getcheckoutpage: async (req, res) => {
        // console.log("sdxcfgvbhnjkmcfgvbhjkm//////////////////");
        let user = req.session.user
        let products = await userhelper.GetCart(req.session.user._id)
        // console.log(products,"yugdo8ygwctgwct7edf8ydgvcybhv");
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        let totalprice = 0;
        for (var i = 0; i < products.length; i++) {
            totalprice = totalprice + products[i].subTotal
            products[i].productsDetails.product_price = products[i].productsDetails.product_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            products[i].subTotal = products[i].subTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        }
        totalprice = totalprice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        const address = await userhelper.GetAddress(req.session.user._id)
        // console.log(address,"adreesssssssssssssssssssssssss////////1234567890");
        res.render('user/checkoutpage', { user, userHeader: true, cartcount, products, totalprice, address })

    },
    addaddress: async (req, res) => {
        try {
            // console.log(req.body,"esdrfgvbhnjmdcfgvbhnjkm/////////////////");
            await userhelper.AddAddress(req.body, req.session.user._id)
            res.redirect('/checkoutpage')
        }
        catch (error) {
            console.log(error);
        }
    },
    placeorder: async (req, res) => {
        // console.log(req.body, "sedrfgyhjgvbhn/////////////////////////////////////////////");
        try {
            let { addressid, paymentMethod, subtotal, GrandTotal } = req.body
            let userId = req.session.user._id
            const cart = await userhelper.GetCart(userId)
            // console.log('/////////////////////////////234567890-234567890');
            // console.log(cart);
            
            var outofstock = false
            cart.forEach(cart => {
                if (cart.products.quantity > cart.productsDetails.stock) {
                    outofstock = true,
                        out_of_stock_product = cart.productsDetails.product_name,
                        available_quantity = cart.productsDetails.stock
                }
            });
            if (outofstock) {
                res.json({
                    status: 'out of stock',
                    product: out_of_stock_product,
                    product_quantuty: available_quantity
                })
            }
            else {
                let address = await userhelper.FindOneAddress(userId, addressid)
                console.log(address,"hgyutyutyu");
                // console.log(products,'esdxcfgvbhnjkm,l//////////////////////////////');
                var products = []
                for (var i = 0; i < cart.length; i++) {
                    let product = { productId: cart[i].products.item, quantity: cart[i].products.quantity }
                    products.push(product)
                }
                // console.log(products, 'aqswdefrghjkdefrgthyjukilo;//////3456789');

                if (paymentMethod === 'cod') {
                    let status = 'pending'
                    subtotal=parseInt(subtotal)
                    GrandTotal=parseInt(GrandTotal)
                    const result = await userhelper.AddOrder(userId, address, paymentMethod, subtotal, GrandTotal, products, status)
                    // console.log(result,"rrrrrrrrrrrrrrrrrrrrrreeeeeeeeeeeeeessssssssssssuuuult");
                    var orderId = result.insertedId
                    // console.log(orderId,"orddddddddddddddddddddddddderiiiiiiiiddddddddddd");

                    products.forEach(async (product) => {

                        // console.log(product.stock,"awsdcfgvbhnjkm,lcfvgbh77777777777777777777777777777777777777777777777");
                        await userhelper.UpdateStock(product.productId, product.quantity)
                    });

                    status = 'placed'
                    await userhelper.OrderStatusChange(orderId, status)
                    await userhelper.DeleteCart(userId)
                    console.log(result);
                    if (result) {
                        res.json({
                            status: "success",
                            message: "order placed successfuly",
                            orderId: result.insertedId
                        })
                    }
                } else if (paymentMethod === 'razorpay') {
                   
                    // console.log(result,"rrrrrrrrrrrrrrrrrrrrrreeeeeeeeeeeeeessssssssssssuuuult");
                    
                    // console.log(orderId,"orddddddddddddddddddddddddderiiiiiiiiddddddddddd");
                    const razoResOrder = await razorpay.GenerateRazorpay(orderId, GrandTotal)
                    const user = await userhelper.GetUserDetails(userId)
                    console.log("razorpay",razoResOrder);
                    res.json({
                        orderId: orderId,
                        razorpayId: razoResOrder.id,
                        amount: razoResOrder.amount,
                        name: user.name,
                        email: user.email,
                        phone: user.phone
                    })

                }
            }
        }
        catch (error) {
            console.log(error);
        }
    },
    ordersuccessrender: async (req, res) => {
        try {
            const user = req.session.user;
            const orderId = req.query.orderId
            let cartcount = null;
            if (req.session.user) {
                cartcount = await userhelper.GetCartCount(req.session.user._id)
            }
            res.render('user/ordersuccess', { user, cartcount, orderId, userHeader: true })
        }
        catch (error) {
            console.log(error);
        }
    },
    orderlistrender: async (req, res) => {
        try {
            const user = req.session.user;
            const orderClass = 'active'
            const orders = await userhelper.OrderListGet()
            console.log(orders);
            for (var i = 0; i < orders.length; i++) {
                // orders[i].GrandTotal = orders[i].GrandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                orders[i].date = orders[i].date.toLocaleString()
            }
            let cartcount = null;
            if (req.session.user) {
                cartcount = await userhelper.GetCartCount(req.session.user._id)
            }

            res.render('user/userorderlist', { user, userHeader: true, cartcount, orders, orderClass })
        }
        catch (error) {
            console.log(error);
        }
    },
    cancelorder: async (req, res, next) => {

        try {

            let { orderId, status } = req.body
            const products = await userhelper.OrderProductAndQuantity(orderId)
            products.forEach(async (product) => {
                await userhelper.UpdateStock(product.products.productId, product.products.quantity)
                await userhelper.OrderStatusChange(orderId, status)
            })
            res.json({
                status: 'changed'
            })

        } catch (error) {
            console.log(error);
            next(error)

        }
    },
    orderdetails: async (req, res) => {
        // console.log("7777777777777777773333333333333333335555555555555");
        // console.log(req.params, 'lll')
        const user = req.session.user
        const orderId = req.params.id
        const orderClass = 'active'
        const orders = await userhelper.OrderDetails(orderId)
        var total = 0;
        for (var i = 0; i < orders.length; i++) {
            total = total + orders[i].subtotal
            orders[i].GrandTotal = orders[i].GrandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            orders[i].productsDetails.product_price = orders[i].productsDetails.product_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            orders[i].subtotal = orders[i].subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            // orders[i].offerPrice = orders[i].offerPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            orders[i].date = orders[i].date.toLocaleString()
        }

        total = total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        res.render('user/userorderdetails', { userHeader: true, total, user, orders, cartcount, orderClass })
    },
    getuserprofile: async (req, res) => {
        try {
            const userId = req.session.user._id
            const user = req.session.user
            const userDetails = await userhelper.GetUserDetails(userId)
            let cartcount = null;
            if (req.session.user) {
                cartcount = await userhelper.GetCartCount(req.session.user._id)
            }
            res.render('user/userprofile', { user, userHeader: true, cartcount, userDetails })

        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    editprofileinfo: (req, res) => {
        try {
            const userId = req.params.id;
            console.log(userId);
            userhelper.UpdateProfileInfo(userId, req.body).then((response) => {
                res.redirect('/userprofile/:id')
            })
        }
        catch (error) {
            console.log(error);
            res.redirect('/userprofile/:id')
        }
    },
    forgotgetotplogin: (req, res) => {

        res.render('user/forgotpasswordotp', { Message });
    },
    forgotsendotp: (req, res) => {
        // console.log(req.body);
        userhelper.OtpNoSend(req.body.mobile).then((response) => {
            if (response.status) {
                if (!response.isBlocked) {
                    // req.session.user = response.user.name;
                    // req.session.userdetails = response.user;
                    // req.session.loggedIn = true;
                    client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                        .verifications
                        .create({ to: `+91${req.body.mobile}`, channel: 'sms' })
                        .then((verification) => {
                            // console.log(verification.status);
                            res.render('user/forgototpverify', { Message, mobile: req.body.mobile });
                        })
                        .catch((err) => console.log(err));
                }
                else {
                    Message = "Your account is blocked";
                    res.redirect('/forgotpassword');
                }
            }
            else {
                Message = "Mobile Number is not registered";
                res.redirect('/forgotpassword')
            }

        })

    },
    forgotverifyotp: (req, res) => {
        console.log(req.body);
        try {
            client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                .verificationChecks
                .create({ to: `+91${req.body.mobile}`, code: `${req.body.otp}` })
                .then((verification_check) => {
                    console.log(verification_check.status);
                    let mobile = req.body.mobile;
                    if (verification_check.valid) {
                        userhelper.OtpNoSend(mobile).then((response) => {
                            // req.session.user = response.user;
                            let userId = response.user._id
                            // console.log(response);
                            // req.session.loggedIn = true;
                            // console.log(verification_check.valid);
                            res.render('user/resetpassword',{userId,userHeader:false})
                        })
                    }
                    else {
                        Message = "Invalid OTP !!"
                        res.redirect('/forgototpsendotp?mobile=' + encodeURIComponent(req.body.mobile))
                    }
                })
        } catch (err) {
            console.log(err);
            res.redirect('/forgototpsendotp?mobile=' + encodeURIComponent(req.body.mobile))
        }
    },
    changepassword: async(req, res) => {
        const user = req.session.user
        let cartcount = null;
            if (req.session.user) {
                cartcount = await userhelper.GetCartCount(req.session.user._id)
            }
        res.render('user/changepassword', { user, userHeader: true })
    },
    changepasswordpost: (req, res) => {
        const userId = req.
        console.log(req.body, "77777777777777777777");
        const password = req.body
        userhelper.UpdatePassword(userId, password)
        res.redirect('/userprofile/:id')
    },
    verifypayment: async (req, res, next) => {

        try {

            let { razorResponse, orderId, amount, order } = req.body
            let { products, addressid, paymentMethod, subtotal, GrandTotal } = order

            const userId = req.session.user._id
            const isPaymentSuccess = razorpay.VerifyPayment(razorResponse)

            if (isPaymentSuccess) {

                products.forEach((product) => {
                    product.productId = new ObjectId(product.productId)
                })

                let address = await userhelper.FindOneAddress(userId, addressid)
                console.log(address,"aaaadddddddddddd");
                const status = 'placed'
                const result = await userhelper.AddOrder(userId, address, paymentMethod, subtotal, GrandTotal, products, status)
                var orderid = result.insertedId
                await userhelper.PaymentStatusChange(orderid, 'paid')
                products.forEach(async (product) => {
                    product.quantity = product.quantity * -1
                    await userhelper.UpdateStock(product.productId, product.quantity)
                })


                await userhelper.DeleteCart(userId)
                

                res.json({
                    status: "success",
                    message: "order placed",
                    orderId: orderid,
                    
                })

            } else {
                await userhelper.PaymentStatusChange(orderid, "cancelled")
                res.json({
                    status: "cancelled",
                    message: "payment failed"
                })
            }

        } catch (error) {
            console.log(error);
            next(error)

        }

    },
    resetpassword:(req,res)=>{
        const userId = req.params.id
        console.log(userId);
        const password = req.body
        userhelper.UpdatePassword(userId, password)
        res.redirect('/login')
    }
}
