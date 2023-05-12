const { response } = require("express");
const userhelper = require('../helpers/userhelper');

module.exports = {
    checkAdminLoggedIn: (req, res, next) => {
        if (req.session.adminLoggedIn) {
            next();
        } else {
            res.redirect('/admin')
        }
    },

    sessionHandle: (req, res, next) => {
        if (req.session.loggedIn) {
            res.redirect('/')
        } else {
            next();
        }
    },
    checkUserLoggedIn:async(req,res,next)=>{
        if (req.session.loggedIn) {
            if(!req.session.user.isblocked){
                await userhelper.GetUserDetails(req.session.user._id).then((response)=>{
                    req.session.user=response
                    next();
                }) 
            }
            else{
                req.session.user = false;
                req.session.loggedIn=false
                res.redirect('/login');
            }
        } else {
          res.redirect('/login');
        }
        }

}