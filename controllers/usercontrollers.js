const { response } = require('express');
const userhelper=require('../helpers/userhelper');
const { router } = require('../app');

let message

module.exports={
    SignUppost:(req,res)=>{
        userhelper.doSigUp(req.body).then((response)=>{
            req.session.userId=response._id;
            console.log(req.session.user_id);
            req.session.loggedIn=true;
            req.session.user=response;
            req.session.user.name=response.name;
            res.redirect('/');
        })
    },
    Loginrender:(req,res)=>{
        if(req.session.loggedIn){
            res.redirect('/');
        }        
        else{
            res.render('user/userLogin',{user:true, userHeader:false,message});
            message=''
        }

    },


    Loginpost:(req,res)=>{
        userhelper.doLogin(req.body).then((response)=>{
            if(response.status){
                if(response.user.isblocked){
                    message='user blocked !!!'
                    res.redirect('/login');
                }else{
                    req.session.loggedIn=true;
                    req.session.user=response.user
                    res.redirect('/');
                }
            }
            else{
                message='invalid Email Or Password'
                res.redirect('/login')
            }
        })
    },
    Logoutget:(req,res)=>{
        // console.log("logout");
        req.session.user=false;
        req.session.loggedIn=false;
        res.redirect('/');
    },
    HomePagerender:(req, res)=>{
        let user =req.session.user
        console.log(user);
        res.render('user/index',{userHeader:true,user})
    },
    SignUprender:(req,res)=>{
        res.render('user/userSignup',{user:true,userHeader:false});
    },
    GetViewProducts:(req,res)=>{
        // req.session.loggedIn=true;
        let user =req.session.user

        userhelper.viewProducts().then((products)=>{
            console.log("this is product user side---", products.length);
            res.render('user/view-products',{user,products,userHeader:true});
        })
    },
    singleproductview:(req,res)=>{
        // req.session.loggedIn=true;
        let user =req.session.user
        userhelper.SinglrProductView(req.params.id).then((productdetails)=>{
            res.render('user/singleproductview',{user,productdetails,userHeader:true})
        })
    }
}
