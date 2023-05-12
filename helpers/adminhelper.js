const db = require('../config/connection');
const collection = require('../config/collections');
// const bcrypt = require('bcrypt');
// const Id = require('objectid');
// const { orderdetails } = require('../controllers/admincontrollers');
const objectId = require('mongodb-legacy').ObjectId;
// const { Collection, ObjectID } = require('mongodb');
// var objectId = require('mongodb').ObjectID


module.exports = {
    AdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            console.log(adminData);
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.username });
            console.log(admin, 'oooooooooooooooooooooooooooooooooooo');
            if (admin) {
                if (admin.password == adminData.password) {
                    response.admin = admin;
                    response.adminname = admin.name;
                    response.status = true;
                    resolve(response);
                }
                else {
                    console.log("admin not  found");
                    resolve({ status: false })
                }
            }

        })

    },
    
    AdminUserListView: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            console.log(user);
            resolve(user);
        })
    },
    
    
    // Geteditcategory:(categoryId)=>{
    //     return new Promise((resolve,reject)=>{
    //         let editcategory=db.get().collection(collection.PRODUCT_CATEGORY).findOne({_id: new objectId(categoryId)})
    //         console.log(editcategory);
    //         resolve(editcategory);
    //     })
    // },
    
    
    
    UnBlockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new objectId(userId) },
                {
                    $set: {
                        isblocked: true
                    }
                }).then((response) => {
                    resolve();
                })
        })
    },
    BlockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new objectId(userId) },
                {
                    $set: {
                        isblocked: false
                    }
                }).then((response) => {
                    resolve();
                })
        })
    },
    OrderListGet: () => {
        const orders = db.get().collection(collection.ORDER_COLLECTION).find().sort({ date: -1 }).toArray()
        return orders
    },
    FindPriceOfOrder: (orderId) => {
        const order = db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: {
                    _id: new objectId(orderId)
                }
            },
            {
                $project: {
                    GrandTotal: 1
                }
            }
        ]).toArray()
        return order
    },
    OrderStatusChange: async (orderId, status) => {
        const result = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: new objectId(orderId) },
            { $set: { status: status } })
        if (status === 'deliverd') {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: new objectId(orderId) }, {
                $set: { paymentStatus: 'paid' }
            })
        }
    },
    PaymentStatusChange:async(orderId,status)=>{
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new objectId(orderId)},{
            $set:{
              paymentStatus:status}
          })
    },
    OrderAndUserDetails:async(orderId)=>{
        const Order= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: { _id: new objectId(orderId) }

            },
            {
                $unwind: { path: "$products" }
            },
            {
                $lookup: {
                    from: "product",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productsDetails"
                }
            },
            {
                $unwind: { path: "$productsDetails" }
            },
            {
                $lookup: {
                  from: "user",
                  localField: 'userId',
                  foreignField: "_id",
                  as: "userDetails"
                }
            },
            {
                $unwind: {
                  path: "$userDetails",
                  
                }
            },
            {
                $addFields:{'subtotal':{$multiply:['$products.quantity','$productsDetails.product_price']}}
            }
        ]).toArray()
   console.log(Order);
        return Order
    }
}
