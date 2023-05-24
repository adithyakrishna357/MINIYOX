const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('express');
let message
module.exports = {
    DoSigUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.phone = Number(userData.phone);
            const mobileExist = await db.get().collection(collection.USER_COLLECTION).findOne({
                phone: userData.phone
            });
            const emailExist = await db.get().collection(collection.USER_COLLECTION).findOne({
                email: userData.email
            });
            if (mobileExist && emailExist) {
                resolve({ status: false, message: "This Email and mobile number is already regsitered with another account..!" })
            } else if (mobileExist) {
                resolve({ status: false, message: "This mobile number is already regsitered with another account..!" });
            } else if (emailExist) {
                resolve({ status: false, message: "This Email is already regsitered with another account..!" });
            } else {
                userData.isblocked = false;
                userData.password = await bcrypt.hash(userData.password, 10);
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async (data) => {
                    dataDoc = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: data.insertedId });
                    resolve({ status: true, dataDoc});
                })
            }
        })
    },
    DoLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let Logginstatus = false;
            let response = {}
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    }
                    else {
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
            mobile = Number(mobile)
            let response = {}
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: mobile })
            if (user) {
                response.user = user;
                response.status = true;
                response.isBlocked = user.isblocked;
                resolve(response);
            }
            else {
                response.status = false;
                resolve(response);
            }
        })
    },
    GetCart: async (userId) => {
        const cartItems = await db.get().collection(collection.CART_COLLECTION)
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
        return cartItems;
    },
    AddCart: (proId, userId) => {
        const proObj = {
            item: new ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (res, rej) => {
            const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (userCart) {
                const proExist = userCart.products.findIndex(product => product.item == proId)
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
                const cartObj = {
                    user: new ObjectId(userId),
                    products: [proObj]
                }
                await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    res()
                })
            }
        })
    },
    GetCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            const cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
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
                resolve()
            }).catch((err) => {
                console.log(err);
            })
        })
    },
    ChangeCartQuantity: (details, userId) => {
        details.count = parseInt(details.count)
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
    EditAddress: async (address, userId,addressId) => {
        address._id = new ObjectId()
        address.pincode = parseInt(address.pincode)
        address.phone = parseInt(address.phone)
        await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(userId),'address._id':new ObjectId(addressId) }, {
            $set:{
                'address.$.name':address.name,
                'address.$.address':address.address,
                'address.$.district':address.district,
                'address.$.city':address.city,
                'address.$.pincode':address.pincode,
                'address.$.phone':address.phone
            }
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
        const address = db.get().collection(collection.USER_COLLECTION).aggregate([
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
    AddOrder: async (userId, address, paymentMethod, subtotal, GrandTotal, products, status,coupon) => {
        if (coupon) {
            var coupons = await db.get().collection(collection.COUPON_COLLECTION).findOne(
                {couponcode: coupon}
            )
            if(coupons){
                var couponCode = coupon
            }
            

            try {
                if(couponCode){
                    const couponExist = await db.get().collection(collection.USER_COLLECTION).findOne(
                        {
                            _id: new ObjectId(userId),
                            usedCoupons: { $elemMatch: { couponCode } }
                        }
                    )
                    if (!couponExist) {
                      var couponon = await  db.get().collection(collection.USER_COLLECTION).updateOne(
                            {
                                _id: new ObjectId(userId)
                            },
                            {
                                $push: { usedCoupons: { couponCode } }
                            }
                        )
                    }
                }
                
            }
            catch (err) {
                console.log(err);
            }
        }
        if(couponon) {
            userId = new ObjectId(userId)
            const paymentStatus = 'pending'
            const orderDate = new Date().toISOString().slice(0, 10)
            const date = new Date()
            const result = await db.get().collection(collection.ORDER_COLLECTION).insertOne(
                { userId: userId, deliveryDetails: address, products: products, subtotal: subtotal, GrandTotal, paymentMethod, paymentStatus, date, orderDate, status,discount:coupons.discount }
            )
            return result
        }
        else{
            userId = new ObjectId(userId)
            const paymentStatus = 'pending'
            const orderDate = new Date().toISOString().slice(0, 10)
            const date = new Date()
            const result = await db.get().collection(collection.ORDER_COLLECTION).insertOne(
                { userId: userId, deliveryDetails: address, products: products, subtotal: subtotal, GrandTotal, paymentMethod, paymentStatus, date, orderDate, status}
            )
            return result
        }
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
                $addFields: { subtotal: { $multiply: ['$products.quantity', '$productsDetails.product_price'] } }
            }
        ]).toArray()
        return Order
    },
    GetUserDetails: async (userId) => {
        const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(userId) })
        return user
    },
    UpdateProfileInfo: (userId, userData) => {
        userData.phone = Number(userData.phone);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(userId) },
                {
                    $set: {
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    UpdatePassword: async (userId, password) => {
        password = await bcrypt.hash(password.password, 10);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(userId) },
                {
                    $set: {
                        password: password
                    }
                })
        }).then(() => {
            resolve()
        })
    },
    PaymentStatusChange: async (orderId, status) => {
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: new ObjectId(orderId) }, {
            $set: {
                paymentStatus: status
            }
        })
    },
    RemoveProfileAddress: (userId, addrsId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne(
                {
                    _id: new ObjectId(userId),
                    address: { $elemMatch: { _id: new ObjectId(addrsId) } }
                },
                {
                    $pull: {
                        address: {
                            _id: new ObjectId(addrsId)
                        }
                    }
                }
            ).then(() => {
                resolve()
            }).catch((err) => {
                console.log(err);
            })
        })
    },
    ProductCount: () => {
        return new Promise(async (resolve, reject) => {
            const productCount = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments()
            resolve(productCount)
        })
    },
    AddToWish: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            const user = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: new ObjectId(userId) });
            proId = new ObjectId(proId)
            const productexist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne(
                {
                    user: new ObjectId(userId),
                    products: { $elemMatch: { $eq: proId } }
                }
            )
            if (user) {
                if (productexist) {
                    resolve("product exist")
                }
                else {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
                        { user: new ObjectId(userId) },
                        {
                            $push: { products: proId }
                        },
                        {
                            upsert: true
                        }
                    ).then((response) => {
                        resolve(response)
                    })
                }
            }
            else {
                const userWishlist = {
                    user: new ObjectId(userId),
                    products: [proId]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(userWishlist).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    WishListDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                userId = new ObjectId(userId)
                result = await db.get().collection(collection.WISHLIST_COLLECTION)
                    .aggregate(
                        [
                            {
                                '$match': {
                                    'user': new ObjectId(userId)
                                }
                            }, {
                                '$unwind': {
                                    'path': '$products',
                                    'preserveNullAndEmptyArrays': true
                                }
                            }, {
                                '$lookup': {
                                    'from': 'product',
                                    'localField': 'products',
                                    'foreignField': '_id',
                                    'as': 'productDetails'
                                }
                            }, {
                                '$project': {
                                    'productDetails': 1,
                                    'products.quantity': 1,
                                    '_id': 0
                                }
                            }
                        ]
                    ).toArray();
                if (result.length != 0) {
                    if (result.length === 1) {
                        if (result[0].productDetails.length === 0) {
                            resolve(null)
                        }
                    }
                    resolve(result)
                } else {
                    resolve(null)
                }
            } catch {
                resolve(null)
            }
        })
    },
    RemoveWishlistProduct: (proId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
                {
                    user: new ObjectId(userId)
                },
                {
                    $pull: {
                        products: new ObjectId(proId)
                    }
                }
            ).then((response) => {
                resolve()
            }).catch((err) => {
                console.log(err);
            })
        })
    },
    CouponApply: (couponCode, userId) => {
        return new Promise(async (resolve, reject) => {
            const couponExist = await db.get().collection(collection.USER_COLLECTION).findOne(
                {
                    _id: new ObjectId(userId),
                    usedCoupons: { $elemMatch: {couponCode } }
                }
            )
            const coupon = await db.get().collection(collection.COUPON_COLLECTION)
                .findOne({ couponcode: couponCode });
            if (coupon) {
                if (couponExist) {
                    resolve("couponExist");
                } else {
                    resolve(coupon);
                }
            } else {
                resolve(null);
            }
        })
    },
    GetBannersDetails:()=>{
        return new Promise(async(resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION)
            .find().toArray();
            resolve(banner);
        })
    },
    FindOneWallet:async(userId)=>{
        const wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({user: new ObjectId(userId)})
        return wallet
    },
    UpdateWallet:async(userId,amount)=>{
        await db.get().collection(collection.WALLET_COLLECTION).updateOne({user:new ObjectId(userId)},{
            $inc:{amount:amount}
        })
    },
    CreateWallet:async(userId,amount)=>{
        await db.get().collection(collection.WALLET_COLLECTION).insertOne({user:new ObjectId(userId),amount:amount})
    }
}