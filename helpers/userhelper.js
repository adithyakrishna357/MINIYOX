const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
// const { get, response } = require('../app');
const { ObjectId } = require('mongodb');
const { response } = require('express');

module.exports = {
    DoSigUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.phone = Number(userData.phone);
            userData.isblocked = false;
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async (data) => {
                dataDoc = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: data.insertedId });
                resolve(dataDoc);
            })
        })

    },
    DoLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let Logginstatus = false;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("logged in");
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    }
                    else {
                        console.log("password is not correct");
                        resolve({ status: false })
                    }
                })
            }
            else {
                resolve({ status: false })
            }
        })
    },
    
    
    OtpNoSend: (mobile) => {
        return new Promise(async (resolve, reject) => {
            // mobile=mobile.replace("+91","")
            mobile = Number(mobile)
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: mobile })
            if (user) {
                console.log(user);
                response.user = user;
                response.status = true;
                response.isBlocked = user.isblocked;
                
                resolve(response);
            }
            else {
                response.status = false;
                resolve(response);
                console.log(response);
            }
        })
    },
    GetCart: async (userId) => {

        let cartItems = await db.get().collection(collection.CART_COLLECTION)
            .aggregate([
                {
                    $match: { user: new ObjectId(userId) }

                },
                {
                    $unwind: { path: "$products" }
                },
                {
                    $lookup: {
                        from: "product",
                        localField: "products.item",
                        foreignField: "_id",
                        as: "productsDetails"
                    }
                },
                {
                    $unwind: { path: "$productsDetails" }
                },
                {

                    $project: {
                        products: 1,
                        productsDetails: 1,
                        subTotal: { $multiply: ["$products.quantity", "$productsDetails.product_price"] }
                    }

                }
            ]).toArray()
        // cartItems.forEach(item => {
        //     item.productsDetails[0].quantity = item.products.quantity;
        //     // delete item['products'];
        // })
        // console.log(cartItems, "hiiiiiiii");
        console.log(cartItems);
        return cartItems;
    },


    // (userId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let cartitems = await db.get().collection(collection.CART_COLLECTION).aggregate([
    //             {
    //                 $match: {
    //                   'user': userId
    //                 }
    //               },
    //               {
    //                 $unwind: "$product"
    //               },
    //               {
    //                 $lookup: {
    //                   from: "product",
    //                   localField: "products._id",
    //                   foreignField: "_id",
    //                   as: "cartitems"
    //                 }
    //               }
    //             //   {
    //             //     $project: {
    //             //       _id: 0,
    //             //       product: { $arrayElemAt: ["$product", 0] },
    //             //       quantity: "$product.quantity"
    //             //     }
    //             //   }
    //         ]).toArray()
    //         resolve(cartitems)
    //     })
    // },
    AddCart: (proId, userId) => {
        let proObj = {
            item: new ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (res, rej) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: new ObjectId(userId), 'products.item': new ObjectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then(() => {
                                res()
                            })
                } else {
                    await db.get().collection(collection.CART_COLLECTION).updateOne
                        (
                            {
                                user: new ObjectId(userId)
                            },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            res()
                        })
                }

            } else {
                let cartObj = {
                    user: new ObjectId(userId),
                    products: [proObj]
                }
                await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    res()
                })
            }
        })
    },


    // (productId,userId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         console.log(productId,"/////////////////////////");
    //         let userdata= await db.get().collection(collection.CART_COLLECTION).findOne({user: new ObjectId(userId)})
    //         if(userdata){
    //             db.get().collection(collection.CART_COLLECTION).updateOne({user:new ObjectId(userId)},
    //             {
    //                 $push:{products:new ObjectId(productId)}
    //             }).then((response)=>{
    //                 resolve()
    //             })
    //         }
    //         else{
    //             let cartobj={
    //                 user:new ObjectId(userId),
    //                 products:[new ObjectId(productId)]
    //             }
    //             db.get().collection(collection.CART_COLLECTION).insertOne(cartobj).then((response)=>{
    //                 resolve()
    //             })
    //         }
    //     })
    // },
    GetCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (cart) {
                count = cart.products.length;
            }
            resolve(count)
        })
    },
    CartRemoveProduct: (userId, productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne(
                {
                    user: new ObjectId(userId)
                },
                {
                    $pull: {
                        products: { item: new ObjectId(productId) }
                    }
                }
            ).then((response) => {
                console.log(response);
                resolve()
            }).catch((err) => {
                console.log(err);
            })
        })
    },
    ChangeCartQuantity: (details, userId) => {
        details.count = parseInt(details.count)
        console.log(details);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CART_COLLECTION)
                .updateOne({ user: new ObjectId(userId), 'products.item': new ObjectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }
                    })
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ user: new ObjectId(userId) }, {
                    $pull: {
                        products: { item: new ObjectId(details.product), quantity: 0 }
                    }               //matching condition

                }).then((response) => {
                    resolve(response)
                })
        })
    },
    AddAddress: async (address, userId) => {
        address._id = new ObjectId()
        address.pincode = parseInt(address.pincode)
        address.phone = parseInt(address.phone)
        await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(userId) }, {
            $push: { address: address }
        })
    },
    GetAddress: async (userId) => {
        const getaddress = await db.get().collection(collection.USER_COLLECTION).aggregate([
            { $match: { _id: new ObjectId(userId) } },
            { $unwind: { path: "$address" } },
            { $project: { address: 1 } }

        ]).toArray()
        return getaddress
    },
    FindOneAddress: (userId, addressid) => {
        console.log(userId,"uuuuuuuuuu");
        console.log(addressid,"uuuuuuuuuu");
        let address = db.get().collection(collection.USER_COLLECTION).aggregate([
            {
                $match: {
                    _id: new ObjectId(userId)
                }
            },
            {
                $unwind: {
                    path: '$address',
                }
            },
            {
                $match: {
                    'address._id': new ObjectId(addressid)
                }
            },
            {
                $project: {
                    address: 1, _id: 0
                }
            }
        ]).toArray()
        return address
    },
    AddOrder: async (userId, address, paymentMethod, subtotal, GrandTotal, products, status) => {
        userId = new ObjectId(userId)
        const paymentStatus = 'pending'
        const orderDate = new Date().toISOString().slice(0, 10)
        const date = new Date()
        const result = await db.get().collection(collection.ORDER_COLLECTION).insertOne(
            { userId: userId, deliveryDetails: address, products: products, subtotal: subtotal, GrandTotal, paymentMethod, paymentStatus, date, orderDate, status }
        )
       
        return result
        
    },

    UpdateStock: async (productId, stock) => {
        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: productId }, {
            $inc: { "stock": -stock }
        })
    },
    OrderStatusChange: async (orderId, status) => {

        const result = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: new ObjectId(orderId) }, {
            $set: { status: status }
        })

        if (status === 'deliverd') {

            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: new ObjectId(orderId) }, {
                $set: { paymentStatus: 'paid' }

            })

        }
        // console.log(result);
    },
    DeleteCart: async (userId) => {
        const result = await db.get().collection(collection.CART_COLLECTION).deleteOne({ user: new ObjectId(userId) })
    },
    OrderListGet: () => {
        const orders = db.get().collection(collection.ORDER_COLLECTION).find().sort({ date: -1 }).toArray()
        return orders
    },
    OrderProductAndQuantity: async (orderId) => {
        const products = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            { $match: { _id: new ObjectId(orderId) } },
            { $unwind: { path: '$products' } },
            { $project: { products: 1 } }
        ]).toArray()
        return products
    },
    OrderDetails: async (orderId) => {
        const Order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: { _id: new ObjectId(orderId) }

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
                $addFields: { subtotal : { $multiply: ['$products.quantity', '$productsDetails.product_price'] } }
            }
        ]).toArray()
        console.log(Order);
        return Order
    },
    
    GetUserDetails : async (userId)=>{
        const user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:new ObjectId(userId)})
        return user

    },
    UpdateProfileInfo:(userId,userData)=>{
        userData.phone = Number(userData.phone);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: new ObjectId(userId)},
            {
                $set:{
                    name:userData.name,
                    email:userData.email,
                    phone:userData.phone
                }
            }).then((response)=>{
                console.log(response,"11111111111111111111333333333355555555557777777777");
                resolve()
            })
        })
    },
    UpdatePassword:async(userId,password)=>{
        password = await bcrypt.hash(password.password, 10);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: new ObjectId(userId)},
            {
                $set:{
                    password:password
                }
            })
        }).then(()=>{
            resolve()
        })
    },
    PaymentStatusChange : async(orderId,status)=>{
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new ObjectId(orderId)},{
          $set:{
            paymentStatus:status}
        })
    
  
      }
    
}