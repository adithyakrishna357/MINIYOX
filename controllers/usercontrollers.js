const { response } = require('express');
const userhelper = require('../helpers/userhelper');
const producthelper = require('../helpers/producthelper');
const razorpay = require('../utils/razorpay');
const admincontrollers = require('../controllers/admincontrollers');
const ObjectId = require('mongodb-legacy').ObjectId
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


let message
let Message
let messaGe

module.exports = {
    signuppost: (req, res) => {
        userhelper.DoSigUp(req.body).then((response) => {
            
            console.log(response);
            if (response.status) {
                req.session.userId = response._id;
                req.session.loggedIn = true;
                req.session.user = response.dataDoc;
                console.log(req.session.user);
                req.session.user.name = response.dataDoc.name;

                res.redirect(`/?user=${req.session.user}`);
            }
            else {
                messaGe = response.message
                res.redirect('/signup')
            }

        })
    },
    loginrender: (req, res) => {
        if (req.session.loggedIn) {
            res.redirect('/');
        }
        else {
            res.render('user/userLogin', { userHeader: false, message });
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
        req.session.user = false;
        req.session.loggedIn = false;
        res.redirect('/');
    },
    homepagerender: async (req, res) => {
        const user = req.session.user
        const banner = await userhelper.GetBannersDetails()
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        res.render('user/index', { userHeader: true, user, cartcount, banner })
    },
    signuprender: (req, res) => {
        res.render('user/userSignup', { userHeader: false, messaGe });
    },
    getviewproducts: async (req, res) => {
        let filter = req.query.filter || req.session.filter;
        const user = req.session.user
        let filterproducts = req.session.filterproducts;
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }

        if (filter === "allproducts") {
            filter = null;
            filterproducts = null;
            req.session.filter = null;
            req.session.filterproducts = null
        }
        let currentPage = req.query.page || 1;


        if (filter || filterproducts) {
            producthelper.GetFilteredPro(currentPage, filter).then((products) => {
                req.session.filterproducts = products;
                req.session.filter = filter;

                producthelper.GetFilterproductcount(filter).then((product) => {
                    let totalCount = product.length

                    producthelper.GetProductCategory().then((categories) => {
                        res.render('user/filterpage', { user, cartcount, categories, products, userHeader: true, currentPage, totalCount });
                    })
                })

            })
        }
        else {
            producthelper.ViewProducts(currentPage).then(async (products) => {

                let totalCount = await userhelper.ProductCount()
                producthelper.GetProductCategory().then((categories) => {
                    res.render('user/view-products', { user, cartcount, categories, products, userHeader: true, currentPage, totalCount });
                })
            })
        }
    },
    singleproductview: async (req, res) => {
        const user = req.session.user
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        producthelper.SingleProductView(req.params.id).then((productdetails) => {
            res.render('user/singleproductview', { user, cartcount, productdetails, userHeader: true })
        })
    },
    getotplogin: (req, res) => {
        if (req.session.loggedIn) {
            res.redirect('/');
        }
        else {
            res.render('user/userotpLogin', { Message });
        }

    },
    sendotp: (req, res) => {
        userhelper.OtpNoSend(req.body.mobile).then((response) => {
            if (response.status) {
                if (!response.isBlocked) {
                    client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                        .verifications
                        .create({ to: `+91${req.body.mobile}`, channel: 'sms' })
                        .then((verification) => {
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
        userhelper.OtpNoSend(req.body.mobile).then((response) => {
            if (response.status) {
                if (!response.isBlocked) {
                    client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                        .verifications
                        .create({ to: `+91${req.body.mobile}`, channel: 'sms' })
                        .then((verification) => {
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
        try {
            client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                .verificationChecks
                .create({ to: `+91${req.body.mobile}`, code: `${req.body.otp}` })
                .then((verification_check) => {
                    let mobile = req.body.mobile;
                    if (verification_check.valid) {
                        userhelper.OtpNoSend(mobile).then((response) => {
                            req.session.user = response.user;
                            req.session.loggedIn = true;
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
        const user = req.session.user
        let products = await userhelper.GetCart(req.session.user._id)
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        let totalprice = 0;

        for (var i = 0; i < products.length; i++) {
            if (products[i].productsDetails.Offer > 0) {
                products[i].productsDetails.product_price = (products[i].productsDetails.product_price - products[i].productsDetails.Offer)
                products[i].subTotal = (products[i].subTotal - (products[i].products.quantity * products[i].productsDetails.Offer))
                totalprice = totalprice + products[i].subTotal
                products[i].productsDetails.product_price = products[i].productsDetails.product_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                products[i].subTotal = products[i].subTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            }
            else {
                totalprice = totalprice + products[i].subTotal
                products[i].productsDetails.product_price = products[i].productsDetails.product_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                products[i].subTotal = products[i].subTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

            }
        }
        totalprice = totalprice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        res.render('user/shoppingcart', { user, userHeader: true, cartcount, products, totalprice })
    },


    addcart: (req, res) => {
        userhelper.AddCart(req.params.id, req.session.user._id).then(async () => {
            cartcount = await userhelper.GetCartCount(req.session.user._id);
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
        const userId = req.session.user._id

        userhelper.ChangeCartQuantity(req.body, userId).then((response) => {
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
        const user = req.session.user
        let products = await userhelper.GetCart(req.session.user._id)
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        let totalprice = 0;
        for (var i = 0; i < products.length; i++) {
            if (products[i].productsDetails.Offer > 0) {
                products[i].productsDetails.product_price = (products[i].productsDetails.product_price - products[i].productsDetails.Offer)
                products[i].subTotal = (products[i].subTotal - (products[i].products.quantity * products[i].productsDetails.Offer))
                totalprice = totalprice + products[i].subTotal
                products[i].productsDetails.product_price = products[i].productsDetails.product_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                products[i].subTotal = products[i].subTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            }
            else {
                totalprice = totalprice + products[i].subTotal
                products[i].productsDetails.product_price = products[i].productsDetails.product_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                products[i].subTotal = products[i].subTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            }
        }
        totalprice = totalprice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        const address = await userhelper.GetAddress(req.session.user._id)
        const wallet = await userhelper.FindOneWallet(req.session.user._id)
        let walletAmount
        if (wallet) {
            walletAmount = wallet.amount
        }
        else {
            walletAmount = 0000
        }
        res.render('user/checkoutpage', { user, userHeader: true, cartcount, products, totalprice, address, walletAmount })
    },
    addaddress: async (req, res) => {
        try {
            await userhelper.AddAddress(req.body, req.session.user._id)
            res.redirect('/checkoutpage')
        }
        catch (error) {
            console.log(error);
        }
    },
    placeorder: async (req, res) => {
        try {
            let { addressid, paymentMethod, subtotal, GrandTotal, coupon } = req.body
            const userId = req.session.user._id
            const cart = await userhelper.GetCart(userId)
            let outofstock = false
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
                let products = []
                for (let i = 0; i < cart.length; i++) {
                    let product = { productId: cart[i].products.item, quantity: cart[i].products.quantity }
                    products.push(product)
                }
                if (paymentMethod === 'cod') {
                    let status = 'pending'
                    subtotal = parseInt(subtotal)
                    GrandTotal = parseInt(GrandTotal)
                    const result = await userhelper.AddOrder(userId, address, paymentMethod, subtotal, GrandTotal, products, status, coupon)
                    var orderId = result.insertedId

                    products.forEach(async (product) => {
                        await userhelper.UpdateStock(product.productId, product.quantity)
                    });

                    status = 'placed'
                    await userhelper.OrderStatusChange(orderId, status)
                    await userhelper.DeleteCart(userId)
                    if (result) {
                        res.json({
                            status: "success",
                            message: "order placed successfuly",
                            orderId: result.insertedId
                        })
                    }
                } else if (paymentMethod === 'razorpay') {

                    const razoResOrder = await razorpay.GenerateRazorpay(orderId, GrandTotal)
                    const user = await userhelper.GetUserDetails(userId)
                    res.json({
                        orderId: orderId,
                        razorpayId: razoResOrder.id,
                        amount: razoResOrder.amount,
                        name: user.name,
                        email: user.email,
                        phone: user.phone
                    })
                }
                else if (paymentMethod === 'wallet') {
                    let status = "pending"
                    subtotal = parseInt(subtotal)
                    GrandTotal = parseInt(GrandTotal)
                    const result = await userhelper.AddOrder(userId, address, paymentMethod, subtotal, GrandTotal, products, status, coupon)
                    await userhelper.WalletTransAdd(userId, "order payment", GrandTotal)
                    var orderId = result.insertedId;
                    products.forEach(async (product) => {
                        await userhelper.UpdateStock(product.productId, -product.quantity)
                    });

                    await userhelper.PaymentStatusChange(orderId, 'paid')
                    let amount = GrandTotal * -1
                    await userhelper.UpdateWallet(userId, amount)
                    status = 'placed'
                    await userhelper.OrderStatusChange(orderId, status)
                    await userhelper.DeleteCart(userId)
                    if (result) {
                        res.json({
                            status: "success",
                            message: "order placed successfuly",
                            orderId: result.insertedId
                        })
                    }
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
            const orders = await userhelper.OrderListGet(user._id)
            for (let i = 0; i < orders.length; i++) {
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
            const userId = req.session.user._id;
            let { orderId, status } = req.body
            const products = await userhelper.OrderProductAndQuantity(orderId)
            products.forEach(async (product) => {
                await userhelper.UpdateStock(product.products.productId, product.products.quantity)
                // await userhelper.WalletTransAdd(userId,"cancel order",GrandTotal)
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
        const user = req.session.user
        const orderId = req.params.id
        const orderClass = 'active'
        const orders = await userhelper.OrderDetails(orderId)
        let total = 0;
        for (var i = 0; i < orders.length; i++) {
            total = total + orders[i].subtotal
            orders[i].GrandTotal = orders[i].GrandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            orders[i].productsDetails.product_price = orders[i].productsDetails.product_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            orders[i].subtotal = orders[i].subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            if (orders[i].discount) {
                orders[i].discount = orders[i].discount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            }
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

        userhelper.OtpNoSend(req.body.mobile).then((response) => {
            if (response.status) {
                if (!response.isBlocked) {
                    client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                        .verifications
                        .create({ to: `+91${req.body.mobile}`, channel: 'sms' })
                        .then((verification) => {
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
        try {
            client.verify.v2.services('VA71c499a309a0a26cfd9ddc2921158844')
                .verificationChecks
                .create({ to: `+91${req.body.mobile}`, code: `${req.body.otp}` })
                .then((verification_check) => {
                    const mobile = req.body.mobile;
                    if (verification_check.valid) {
                        userhelper.OtpNoSend(mobile).then((response) => {
                            const userId = response.user._id
                            res.render('user/resetpassword', { userId, userHeader: false })
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
    changepassword: async (req, res) => {
        const user = req.session.user
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        res.render('user/changepassword', { user, userHeader: true, cartcount })
    },
    changepasswordpost: (req, res) => {
        const userId = req.session.user._id
        const password = req.body
        userhelper.UpdatePassword(userId, password)
        res.redirect('/userprofile/:id')
    },
    verifypayment: async (req, res, next) => {
        try {
            let { razorResponse, orderId, amount, order } = req.body
            let { products, addressid, paymentMethod, subtotal, GrandTotal, coupon } = order
            const userId = req.session.user._id
            const isPaymentSuccess = razorpay.VerifyPayment(razorResponse)

            if (isPaymentSuccess) {
                products.forEach((product) => {
                    product.productId = new ObjectId(product.productId)
                })
                let address = await userhelper.FindOneAddress(userId, addressid)
                const status = 'placed'
                const result = await userhelper.AddOrder(userId, address, paymentMethod, subtotal, GrandTotal, products, status, coupon)
                let orderid = result.insertedId
                await userhelper.PaymentStatusChange(orderid, 'paid')
                products.forEach(async (product) => {
                    product.quantity = product.quantity * -1
                    await userhelper.UpdateStock(product.productId, -product.quantity)
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
    resetpassword: (req, res) => {
        const userId = req.params.id
        const password = req.body
        userhelper.UpdatePassword(userId, password)
        res.redirect('/login')
    },
    manageaddress: async (req, res) => {
        const userId = req.session.user._id;
        const user = await userhelper.GetUserDetails(userId)
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        res.render('user/manageaddress', { user, userHeader: true, cartcount })
    },
    manageaddaddress: async (req, res) => {
        try {
            await userhelper.AddAddress(req.body, req.session.user._id)
            res.redirect('/manageaddress')
        }
        catch (error) {
            console.log(error);
        }
    },
    editaddress: async (req, res) => {
        const userId = req.session.user._id
        const addressId = req.params.id
        try {
            await userhelper.EditAddress(req.body, userId, addressId).then(() => {
                res.redirect('/manageaddress')
            })
        }
        catch (err) {
            console.log(err);
        }
    },
    removeaddress: (req, res) => {
        const addrId = req.params.id;
        const userId = req.session.user._id;
        userhelper.RemoveProfileAddress(userId, addrId).then(() => {
            res.json({ status: true })
        })
    },
    search: async (req, res) => {
        const searchValue = req.body
        const user = req.session.user;
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }

        producthelper.Search({ search: searchValue }).then(async (products) => {
            const categories = await producthelper.GetProductCategory()
            if (products.length > 0) {
                res.render('user/searchproduct', { userHeader: true, products, cartcount, categories, user })
            } else {
                res.render('user/searchempty', { userHeader: true, products, user })
            }

        }).catch((err) => {
            res.json({
                status: 'error',
                message: err.message
            });
        })
    },
    addtowish: (req, res) => {
        const proId = req.params.id
        const userId = req.session.user._id
        userhelper.AddToWish(proId, userId).then((response) => {
            if (response === "product exist") {
                res.json({
                    status: "not success"
                })
            }
            else {
                res.json({
                    status: "success"
                })
            }
        })
    },
    wishlistdetails: async (req, res) => {
        const user = req.session.user;
        const products = await userhelper.WishListDetails(req.session.user._id)
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        res.render('user/wishlist', { user, products, userHeader: true, cartcount })
    },
    removewishlistproduct: (req, res) => {
        const prodId = req.params.id
        const userId = req.session.user._id
        userhelper.RemoveWishlistProduct(prodId, userId).then(() => {
            res.json({ status: true })
        })
    },
    couponapply: (req, res) => {
        const userId = req.session.user._id
        userhelper.CouponApply(req.body.coupon, userId).then((coupon) => {
            if (coupon) {
                if (coupon === "couponExist") {
                    res.json({
                        status: "success",
                        message: "coupon is already used !!",
                        used: true,
                        coupon: coupon
                    })
                }
                else {
                    res.json({
                        status: "success",
                        coupon: coupon,
                        total: coupon.discount
                    })
                }
            }
            else {
                res.json({
                    message: "coupon is not valid"
                })
            }
        })
    },
    getwallet: async (req, res) => {
        const userId = req.session.user._id;
        const user = req.session.user
        const userDetails = await userhelper.GetUserDetails(userId)
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        const wallet = await userhelper.FindOneWallet(userId)
        let walletAmount
        if (wallet) {
            walletAmount = wallet.amount
        }
        else {
            walletAmount = 0000
        }
        res.render('user/mywallet', { user, userHeader: true, cartcount, userDetails, walletAmount })
    },
    wallettranscations: async (req, res) => {
        const user = req.session.user
        let cartcount = null;
        if (req.session.user) {
            cartcount = await userhelper.GetCartCount(req.session.user._id)
        }
        const wallet = await userhelper.GetAllWallet(req.session.user._id);
        for(let i=0;i<wallet[0].transactions.length;i++){
            const newDate = new Date(wallet[0].transactions[i].date);
            const year = newDate.getFullYear();
            const month = newDate.getMonth() + 1;
            const day = newDate.getDate();
            const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
            wallet[0].transactions[i].date = formattedDate;
        }
        res.render('user/wallettable', { user, userHeader: true,cartcount,wallet })
    }
}
