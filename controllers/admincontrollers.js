const express = require('express');
const router = express.Router();
const adminhelper = require('../helpers/adminhelper');
const producthelper = require('../helpers/producthelper');
const categoryhelper = require('../helpers/categoryhelper');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const userhelper = require('../helpers/userhelper');


let message

module.exports = {

    homepage: async (req, res) => {
        if (req.session.adminLoggedIn) {
            const categorycount = await adminhelper.GetCategoryCount()
            const productsCount = await adminhelper.GetProductCount()
            const orderCount = await adminhelper.GetOrderCount()
            const totalRevenue = await adminhelper.GetTotalRevenue()
            const total = totalRevenue[0].total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            const startMonthDate = new Date(new Date().getFullYear(), new Date().getMonth())
            const endMonthDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1)
            
            let monthlyAmount = await adminhelper.MontlySales(startMonthDate, endMonthDate)
            if (monthlyAmount[0]) {
                monthlyAmount = monthlyAmount[0].total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            } else {
                monthlyAmount = "₹000"
            }
            res.render("admin/adminhomepage", { admin: true, layout: 'adminLayout', categorycount, productsCount, orderCount, total,monthlyAmount });
        } else {
            res.redirect('/admin/login');
        }
    },
    adminlogin: (req, res) => {
        if (req.session.adminLoggedIn) {
            res.redirect('/admin');
        } else {

            res.render('admin/adminLogin', { message });
            req.session.adminLoginErr = false;
        }
    },
    adminloginpost: (req, res) => {

        adminhelper.AdminLogin(req.body).then((response) => {
            if (response.status) {
                req.session.adminname = response.admin.adminname;
                req.session.admin = response.admin;
                req.session.adminemail = req.body.email;
                req.session.adminLoggedIn = true;
                res.redirect('/admin')
            }
            else {
                req.session.adminLoginErr = true;
                message = "invalid email or password";
                res.redirect('/admin/login')
            }
        })
    },
    adminlogout: (req, res) => {
        req.session.adminLoggedIn = false;
        res.redirect('/admin');
    },
    productpageget: (req, res) => {
        producthelper.AdminProductView().then((products) => {
            res.render('admin/adminproductview', { admin: true, products, layout: 'adminLayout' })
        })
    },
    productcategory: (req, res) => {
        categoryhelper.AdminProductCategory().then((categories) => {
            res.render('admin/productcategory', { admin: true, categories, layout: 'adminLayout' });
        })
    },
    addproduct: (req, res) => {
        categoryhelper.AdminProductCategory().then((categorys) => {
            res.render('admin/addproduct', { admin: true, categorys, layout: 'adminLayout' })
        })
    },
    addproductpost: async (req, res) => {
        try {

            let imgUrl = [];
            for (let i = 0; i < req.files.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path);
                imgUrl.push(result.url);
            }
            producthelper.AddProduct_Post(req.body, (id) => {
                producthelper.AddProduct_Img(id, imgUrl).then((response) => {
                    res.redirect("/admin/adminproductview");
                })
            })
        }
        catch (err) {
            res.redirect("/admin/adminproductview");
        }
    },
    addcategory: (req, res) => {

        categoryhelper.AddCategory_Post(req.body).then((response) => {
            res.json(response)
        })
    },
    adminuserlist: (req, res) => {

        adminhelper.AdminUserListView().then((user) => {

            res.render('admin/adminuserslist', { admin: true, user, layout: 'adminLayout' })
        })
    },
    editproductget: (req, res) => {
        producthelper.GetEditProduct(req.params.id).then((product) => {
            categoryhelper.AdminProductCategory().then((categorie) => {
                res.render('admin/editproduct', { admin: true, product, categorie, layout: 'adminLayout' })
            })
        })
    },
    editproductpost: async (req, res) => {
        try {

            let imgUrl = [];
            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    const result = await cloudinary.uploader.upload(req.files[i].path);
                    imgUrl.push(result.url);
                }
            }
            producthelper.PostEditProduct(req.body, req.params.id).then(() => {
                if(imgUrl){
                    if (imgUrl.length>0) {
                        producthelper.AddProduct_Img(req.params.id, imgUrl).then((response) => {
                        })
                    }
                }
                
                res.redirect('/admin/adminproductview');

            })
        }
        catch (err) {
            res.redirect("/admin/adminproductview");
        }
    },

    editcategorypost: (req, res) => {
        const categorydata = req.body.category_list
        const categoryid = req.body.categoryid

        categoryhelper.PostEditCategory(categorydata, categoryid).then((responses) => {
            res.json({
                status: responses.status,
                message: "category updated"
            });
        })
    },
    listcategory: (req, res) => {
        categoryhelper.ListCategory(req.params.id).then((response) => {
            res.redirect('/admin/productcategory')
        })
    },
    unlistcategory: (req, res) => {
        categoryhelper.UnlistCategory(req.params.id).then((response) => {
            res.redirect('/admin/productcategory')
        })
    },
    listproduct: (req, res) => {
        producthelper.ListProduct(req.params.id).then((response) => {
            res.redirect('/admin/adminproductview')
        })
    },
    unlistproduct: (req, res) => {
        producthelper.UnlistProduct(req.params.id).then((response) => {
            res.redirect('/admin/adminproductview')
        })
    },
    blockuser: (req, res) => {
        adminhelper.BlockUser(req.params.id).then((response) => {
            res.redirect('/admin/adminuserlist')
        })
    },
    unblockuser: (req, res) => {
        adminhelper.UnBlockUser(req.params.id).then((response) => {
            res.redirect('/admin/adminuserlist')
        })
    },
    orderlistrender: async (req, res) => {
        try {
            const orderClass = 'active'
            const orders = await adminhelper.OrderListGet()
            for (let i = 0; i < orders.length; i++) {
                orders[i].GrandTotal = orders[i].GrandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                orders[i].date = orders[i].date.toLocaleString()
            }

            res.render('admin/ordersview', { admin: true, layout: 'adminLayout', orders, orderClass })
        }
        catch (error) {
            console.log(error);
        }
    },
    changeorderstatus: async (req, res) => {
        try {
            let { orderId, paymentStatus, status, userId } = req.body
            if (status === 'cancelled' && paymentStatus === 'paid') {
                const order = await adminhelper.FindPriceOfOrder(orderId)
                const amount = order[0].GrandTotal
                const isWalletExist = await userhelper.FindOneWallet(userId)
                if (isWalletExist) {
                    await userhelper.UpdateWallet(userId, amount)
                    await adminhelper.OrderStatusChange(orderId, status)
                    await adminhelper.PaymentStatusChange(orderId, 'refund')
                }
                else {
                    await userhelper.CreateWallet(userId, amount)
                    await adminhelper.OrderStatusChange(orderId, status)
                    await adminhelper.PaymentStatusChange(orderId, 'refund')
                }

            }
            else if (status === 'returned') {
                const order = await adminhelper.FindPriceOfOrder(orderId)
                const amount = order[0].GrandTotal
                const isWalletExist = await userhelper.FindOneWallet(userId)
                if (isWalletExist) {
                    await userhelper.UpdateWallet(userId, amount)
                    await adminhelper.OrderStatusChange(orderId, status)
                    await adminhelper.PaymentStatusChange(orderId, 'refund')
                }
                else {
                    await userhelper.CreateWallet(userId, amount)
                    await adminhelper.OrderStatusChange(orderId, status)
                    await adminhelper.PaymentStatusChange(orderId, 'refund')
                }
            }
            else {
                await adminhelper.OrderStatusChange(orderId, status)
            }
            res.json({
                status: "status changed"
            })
        }
        catch (error) {
            console.log(error);
        }
    },
    ordersandusers: async (req, res) => {

        const orderId = req.params.id
        const orderClass = 'active'
        const orders = await adminhelper.OrderAndUserDetails(orderId)
        let total = 0;
        for (let i = 0; i < orders.length; i++) {
            total = total + orders[i].subtotal
            orders[i].GrandTotal = orders[i].GrandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            orders[i].productsDetails.product_price = orders[i].productsDetails.product_price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            orders[i].subtotal = orders[i].subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            if(orders[i].discount){
                orders[i].discount = orders[i].discount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            }
            orders[i].date = orders[i].date.toLocaleString()

        }
        total = total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        res.render('admin/orderdetails', { admin: true, layout: 'adminLayout', total, orders, orderClass })
    },
    couponget: async (req, res) => {
        const coupons = await adminhelper.GetAllCoupons();
        coupons.forEach(coupon => {
            coupon.expired = coupon.status === 'EXPIRED' ? true : false;
        });
        res.render('admin/coupon', { admin: true, layout: 'adminLayout', coupons })
    },
    addcoupon: (req, res) => {
        adminhelper.AddCoupon(req.body).then(() => {
            res.redirect('/admin/getcoupon')
        })
    },
    editcouponpost: (req, res) => {
        const couponId = req.params.id
        adminhelper.EditCouponPost(couponId, req.body).then(() => {
            res.redirect('/admin/getcoupon')
        })
    },
    deletecoupon: (req, res) => {
        const couponId = req.params.id
        adminhelper.DeleteCoupon(couponId).then(() => {
            res.redirect('/admin/getcoupon')
        })
    },
    getbanners: (req, res) => {
        adminhelper.GetBanners().then((banner) => {
            res.render('admin/banner', { admin: true, banner, layout: 'adminLayout' })
        })
    },
    addbanner: (req, res) => {
        res.render('admin/addbanner', { admin: true, layout: 'adminLayout' })
    },
    addbannerpost: async (req, res) => {
        try {
            const result = await cloudinary.uploader.upload(req.file.path);
            adminhelper.AddBanner(req.body, (id) => {
                adminhelper.UpdateBannerImages(id, result.url).then((response) => {
                    res.redirect('/admin/bannerview')
                })
            })
        }
        catch (err) {
            res.redirect('/admin/bannerview')
        }
    },
    listbanner: (req, res) => {
        adminhelper.BannerList(req.params.id).then(() => {
            res.redirect('/admin/bannerview')
        })
    },
    unlistbanner: (req, res) => {
        adminhelper.UnListbanner(req.params.id).then(() => {
            res.redirect('/admin/bannerview')
        })
    },
    deletebanner: (req, res) => {
        adminhelper.DeleteBanner(req.params.id).then(() => {
            res.redirect('/admin/bannerview')
        })
    },
    graphstatics:async(req,res)=>{
        const OrderStatistics = await adminhelper.GetOrderStatics()
        const delivers  = await adminhelper.GetSaleStatics()
        res.json({OrderStatistics,delivers})
    },
    salesreport:(req,res)=>{
        adminhelper.GetAllSales().then((orders)=>{
            const months = ["JAN","FEB","MARCH","APRIL","MAY","JUNE","JULY","AUG","SEP","OCT","NOV","DEC"];
            for(let i=0;i<orders.length;i++){
                orders[i].date = orders[i].date.getDate()+'-'+months[orders[i].date.getMonth()]+'-'+orders[i].date.getFullYear();
                if(!orders[i].discount){
                    orders[i].discount = 000
                }
            }
            res.render('admin/salesreport',{admin: true,layout: 'adminLayout',orders})
        })
    },
    editbanner:(req,res)=>{
        const bannerId = req.params.id;
        adminhelper.GetEditBanner(bannerId).then((banner)=>{
            res.render('admin/editbanner',{admin: true,layout: 'adminLayout',banner})
        })
    },
    editbannerpost:async(req,res)=>{
        try {
            const banner =req.body;
            let result
            if(req.file){
                result = await cloudinary.uploader.upload(req.file.path);
            }
            adminhelper.EditBannerPost(banner,req.params.id)
            if(result){
                adminhelper.UpdateBannerImages(req.params.id, result.url)
            }
                res.redirect('/admin/bannerview')
        }
        catch (err) {
            res.redirect('/admin/bannerview')
        }
    }
}