var express = require('express');
var router = express.Router();
const adminhelper=require('../helpers/adminhelper');
const cloudinary=require('../utils/cloudinary');
const upload=require('../utils/multer');
const { response } = require('../app');



module.exports={

    homePage: (req, res)=>{
        if(req.session.adminLoggedIn){
          res.render("admin/adminhomepage",{admin:true,layout:'adminLayout'});
        }else{
          res.redirect('/admin/login');
        }
      },
    adminLogin:(req,res)=>{
        if(req.session.adminLoggedIn){
            res.redirect('/admin');
        }else{
            // let admin=req.session.admin;
            // const adminLoginErr = req.session.admin.adminLoginErr;
            res.render('admin/adminLogin',{admin:true,adminheader:true});
            req.session.adminLoginErr=false;
        }
    },
    adminLoginpost:(req,res)=>{
        // console.log(req.body);
        adminhelper.adminLogin(req.body).then((response)=>{
            if(response.status){
                req.session.adminname=response.admin.adminname;
                req.session.admin=response.admin;
                req.session.adminemail=req.body.email;
                req.session.adminLoggedIn=true;
                // res.render('admin/adminhomepage',{admin:true,adminheader:true,adminname:req.session.adminname})
                res.redirect('/admin')
            }
            else{
                req.session.adminLoginErr="invalid email or password";
                res.redirect('/admin/login')
            }
        })
    },
    adminLogout:(req,res)=>{
        req.session.adminLoggedIn=false;
        res.redirect('/admin');
    },
    productpageget:(req,res)=>{
        // req.session.adminLoggedIn=true;
        adminhelper.adminproductview().then((products)=>{
            console.log("this is product admin side---", products.length);
            res.render('admin/adminproductview',{admin:true,products,layout:'adminLayout'})
        })
        
    },
    productcategory:(req,res)=>{
        // req.session.adminLoggedIn=true;
        adminhelper.addproductcategory().then((categories)=>{
            console.log(categories);
            res.render('admin/productcategory',{admin:true,categories,layout:'adminLayout'});
        })
    },
    addproduct:(req,res)=>{
        // req.session.adminLoggedIn=true;
        adminhelper.addproductcategory().then((categorys)=>{
            res.render('admin/addproduct',{admin:true,categorys,layout:'adminLayout'})
        })
    },
    addproductpost:async (req,res)=>{
        try{
            // req.session.adminLoggedIn=true;
            console.log(req.body);
            console.log(req.files);
            let imgUrl = [];
            for(let i=0;i<req.files.length;i++){
                const result = await cloudinary.uploader.upload(req.files[i].path);
                imgUrl.push(result.url);
                console.log(`uploading ... ${result.url}`);
            }
            console.log(imgUrl)
            adminhelper.addproduct_post(req.body, (id)=>{
                adminhelper.addproduct_img(id,imgUrl).then((response)=>{
                    console.log(response);
                    res.redirect("/admin/adminproductview");
                })
            })
        }
        catch(err){
            console.log(err);
            res.redirect("/admin/adminproductview");
        }
    },
    addcategory:(req,res)=>{
        // req.session.adminLoggedIn=true;
        console.log(req.body);
        adminhelper.addcategory_post(req.body)
        res.redirect("/admin/productcategory")
    },
    adminuserlist:(req,res)=>{
        // req.session.adminLoggedIn=true;
        adminhelper.adminuserlistview().then((user)=>{
            console.log(user);
            res.render('admin/adminuserslist',{admin:true,user,layout:'adminLayout'})
        })
    },
    EditproductGet:(req,res)=>{
        adminhelper.getEditProduct(req.params.id).then((product)=>{
            adminhelper.addproductcategory().then((categorie)=>{
                res.render('admin/editproduct',{admin:true,product,categorie,layout:'adminLayout'})
            })
        })
    },
    EditproductPOst:async(req,res)=>{
        try{
            // req.session.adminLoggedIn=true;
            console.log(req.body);
            console.log(req.files);
            console.log(req.params.id);
            let imgUrl = [];
            if(req.files.length>=1){
                for(let i=0;i<req.files.length;i++){
                    const result = await cloudinary.uploader.upload(req.files[i].path);
                    imgUrl.push(result.url);
                    console.log(`uploading ... ${result.url}`);
                }
                console.log(imgUrl)
            }
            adminhelper.PostEditProduct(req.body, req.params.id).then(()=>{
                if(imgUrl>=1){
                    adminhelper.addproduct_img(req.params.id,imgUrl).then((response)=>{
                        console.log(response);
                        //res.redirect("/admin/adminproductview");
                    })
                }
                res.redirect('/admin/adminproductview');
            })
        }
        catch(err){
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
    editcategoryPost:(req,res)=>{
        console.log(req.body,"//////////////////////////////");

        adminhelper.Posteditcategory(req.body,req.params.id).then((response)=>{
            console.log(response);
            res.redirect('/admin/productcategory')
        })
    },
    listcategory:(req,res)=>{
        console.log(req.params.id);
        adminhelper.ListCategory(req.params.id).then((response)=>{
            res.redirect('/admin/productcategory')
        })
    },
    unlistcategory:(req,res)=>{
        console.log(req.params.id);
        adminhelper.UnlistCategory(req.params.id).then((response)=>{
            res.redirect('/admin/productcategory')
        })
    },
    listproduct:(req,res)=>{
        console.log(req.params.id);
        adminhelper.ListProduct(req.params.id).then((response)=>{
            res.redirect('/admin/adminproductview')
        })
    },
    unlistproduct:(req,res)=>{
        console.log(req.params.id);
        adminhelper.UnlistProduct(req.params.id).then((response)=>{
            res.redirect('/admin/adminproductview')
        })
    },
    blockuser:(req,res)=>{
        console.log(req.params.id);
        adminhelper.BlockUser(req.params.id).then((response)=>{
            res.redirect('/admin/adminuserlist')
        })
    },
    unblockuser:(req,res)=>{
        console.log(req.params.id);
        adminhelper.UnBlockUser(req.params.id).then((response)=>{
            res.redirect('/admin/adminuserlist')
        })
    }
}