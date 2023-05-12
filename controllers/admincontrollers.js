var express = require('express');
var router = express.Router();
const adminhelper = require('../helpers/adminhelper');
const producthelper = require('../helpers/producthelper');
const categoryhelper = require('../helpers/categoryhelper');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
// const { response } = require('../app');
// const userhelper = require('../helpers/userhelper');
// const { Db } = require('mongodb-legacy');

let message 

module.exports = {

    homepage: (req, res) => {
        if (req.session.adminLoggedIn) {
            res.render("admin/adminhomepage", { admin: true, layout: 'adminLayout' });
        } else {
            res.redirect('/admin/login');
        }
    },
    adminlogin: (req, res) => {
        if (req.session.adminLoggedIn) {
            res.redirect('/admin');
        } else {
            // let admin=req.session.admin;
            // const adminLoginErr = req.session.admin.adminLoginErr;
            res.render('admin/adminLogin', {message});
            req.session.adminLoginErr = false;
        }
    },
    adminloginpost: (req, res) => {
        // console.log(req.body);
        adminhelper.AdminLogin(req.body).then((response) => {
            if (response.status) {
                req.session.adminname = response.admin.adminname;
                req.session.admin = response.admin;
                req.session.adminemail = req.body.email;
                req.session.adminLoggedIn = true;
                // res.render('admin/adminhomepage',{admin:true,adminheader:true,adminname:req.session.adminname})
                res.redirect('/admin')
            }
            else {
                req.session.adminLoginErr = true;
                message="invalid email or password";
                res.redirect('/admin/login')
            }
        })
    },
    adminlogout: (req, res) => {
        req.session.adminLoggedIn = false;
        res.redirect('/admin');
    },
    productpageget: (req, res) => {
        // req.session.adminLoggedIn=true;
        producthelper.AdminProductView().then((products) => {
            console.log("this is product admin side---", products.length);
            res.render('admin/adminproductview', { admin: true, products, layout: 'adminLayout' })
        })

    },
    productcategory: (req, res) => {
        // req.session.adminLoggedIn=true;
        categoryhelper.AdminProductCategory().then((categories) => {
            console.log(categories);
            res.render('admin/productcategory', { admin: true, categories, layout: 'adminLayout' });
        })
    },
    addproduct: (req, res) => {
        // req.session.adminLoggedIn=true;
        categoryhelper.AdminProductCategory().then((categorys) => {
            res.render('admin/addproduct', { admin: true, categorys, layout: 'adminLayout' })
        })
    },
    addproductpost: async (req, res) => {
        try {
            // req.session.adminLoggedIn=true;
            console.log(req.body);
            console.log(req.files);
            let imgUrl = [];
            for (let i = 0; i < req.files.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path);
                imgUrl.push(result.url);
                console.log(`uploading ... ${result.url}`);
            }
            console.log(imgUrl)
            producthelper.AddProduct_Post(req.body, (id) => {
                producthelper.AddProduct_Img(id, imgUrl).then((response) => {
                    console.log(response);
                    res.redirect("/admin/adminproductview");
                })
            })
        }
        catch (err) {
            console.log(err);
            res.redirect("/admin/adminproductview");
        }
    },
    addcategory: (req, res) => {
        // req.session.adminLoggedIn=true;
        console.log(req.body);
        categoryhelper.AddCategory_Post(req.body)
        res.redirect("/admin/productcategory")
    },
    adminuserlist: (req, res) => {
        // req.session.adminLoggedIn=true;
        adminhelper.AdminUserListView().then((user) => {
            console.log(user);
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
            // req.session.adminLoggedIn=true;
            console.log(req.body);
            console.log(req.files);
            console.log(req.params.id);
            let imgUrl = [];
            if (req.files.length >= 1) {
                for (let i = 0; i < req.files.length; i++) {
                    const result = await cloudinary.uploader.upload(req.files[i].path);
                    imgUrl.push(result.url);
                    console.log(`uploading ... ${result.url}`);
                }
                console.log(imgUrl)
            }
            producthelper.PostEditProduct(req.body, req.params.id).then(() => {
                if (imgUrl >= 1) {
                    producthelper.AddProduct_Img(req.params.id, imgUrl).then((response) => {
                        console.log(response);
                        //res.redirect("/admin/adminproductview");
                    })
                }
                res.redirect('/admin/adminproductview');
            })
        }
        catch (err) {
            console.log(err);
            res.redirect("/admin/adminproductview");
        }
    },
    // editcategoryGet:(req,res)=>{
    //     console.log(req.params.id);
    //     adminhelper.Geteditcategory(req.params.id).then((editcategory)=>{
    //         console.log(editcategory);
    //         res.render('admin/editcategory',{admin:true,editcategory,layout:'adminLayout'})
    //     })
    // },
    editcategorypost: (req, res) => {
        console.log(req.body, "//////////////////////////////");

        categoryhelper.PostEditCategory(req.body, req.params.id).then((response) => {
            console.log(response);
            res.redirect('/admin/productcategory')
        })
    },
    listcategory: (req, res) => {
        console.log(req.params.id);
        categoryhelper.ListCategory(req.params.id).then((response) => {
            res.redirect('/admin/productcategory')
        })
    },
    unlistcategory: (req, res) => {
        console.log(req.params.id);
        categoryhelper.UnlistCategory(req.params.id).then((response) => {
            res.redirect('/admin/productcategory')
        })
    },
    listproduct: (req, res) => {
        console.log(req.params.id);
        producthelper.ListProduct(req.params.id).then((response) => {
            res.redirect('/admin/adminproductview')
        })
    },
    unlistproduct: (req, res) => {
        console.log(req.params.id);
        producthelper.UnlistProduct(req.params.id).then((response) => {
            res.redirect('/admin/adminproductview')
        })
    },
    blockuser: (req, res) => {
        console.log(req.params.id);
        adminhelper.BlockUser(req.params.id).then((response) => {
            res.redirect('/admin/adminuserlist')
        })
    },
    unblockuser: (req, res) => {
        console.log(req.params.id);
        adminhelper.UnBlockUser(req.params.id).then((response) => {
            res.redirect('/admin/adminuserlist')
        })
    },
    orderlistrender: async (req, res) => {
        try {
            const orderClass='active'
            const orders = await adminhelper.OrderListGet()
            console.log(orders);
            for (var i = 0; i < orders.length; i++) {
                orders[i].GrandTotal = orders[i].GrandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                orders[i].date = orders[i].date.toLocaleString()
            }

            res.render('admin/ordersview', { admin: true, layout: 'adminLayout', orders,orderClass })
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
                await adminhelper.OrderStatusChange(orderId, status)
                await adminhelper.PaymentStatusChange(orderId, 'refund')
            }
            else if (status === 'returned') {
                const order = await adminhelper.FindPriceOfOrder(orderId)
                const amount = order[0].GrandTotal
                await adminhelper.OrderStatusChange(orderId, status)
                await adminhelper.PaymentStatusChange(orderId, 'refund')
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
    ordersandusers: async (req,res) => {
        // console.log("7777777777777777773333333333333333335555555555555");
        // console.log(req.params,'lll')
        
        const orderId = req.params.id
        const orderClass = 'active'
        const orders = await adminhelper.OrderAndUserDetails(orderId)
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
        res.render('admin/orderdetails',{admin: true, layout: 'adminLayout',total, orders,orderClass})
    }

}