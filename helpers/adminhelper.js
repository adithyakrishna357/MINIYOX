const db = require('../config/connection');
const collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const objectId = require('mongodb-legacy').ObjectId;
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { response } = require('../app');



module.exports = {
    AdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.username });
            if (admin) {
                if (admin.password == adminData.password) {
                    response.admin = admin;
                    response.adminname = admin.name;
                    response.status = true;
                    resolve(response);
                }
                else {
                    resolve({ status: false })
                }
            }
        })
    },
    AdminUserListView: () => {
        return new Promise(async (resolve, reject) => {
            const user = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user);
        })
    },
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
    PaymentStatusChange: async (orderId, status) => {
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: new objectId(orderId) }, {
            $set: {
                paymentStatus: status
            }
        })
    },
    OrderAndUserDetails: async (orderId) => {
        const Order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
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
                $addFields: { 'subtotal': { $multiply: ['$products.quantity', '$productsDetails.product_price'] } }
            }
        ]).toArray()
        return Order
    },
    AddCoupon: (coupon) => {
        return new Promise(async (resolve, reject) => {
            coupon.discount = Number(coupon.discount);
            coupon.expirydate = new Date(coupon.expirydate);
            coupon.status = true;
            const newDate = new Date();
            if (coupon.date < newDate) {
                coupon.status = 'EXPIRED';
            }
            else {
                coupon.createddate = newDate
            }
            const couponExist = await db.get().collection(collection.COUPON_COLLECTION)
                .findOne({ couponcode: coupon.couponcode });
            if (couponExist) {
                resolve(null);
            } else {
                db.get().collection(collection.COUPON_COLLECTION)
                    .insertOne(coupon).then((response) => {
                        resolve();
                    })
            }
        })
    },
    GetAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            const coupons = await db.get().collection(collection.COUPON_COLLECTION)
                .find().toArray();
            const newDate = new Date();
            coupons.forEach(coupon => {
                if (coupon.expirydate < newDate) {
                    coupon.status = "EXPIRED";
                }
                const months = ["JAN", "FEB", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUG", "SEP", "OCT", "NOV", "DEC"];
                const dateObj = new Date(coupon.expirydate);
                const dateObj2 = new Date(coupon.createddate);
                const day = dateObj.getDate().toString().padStart(2, "0");
                const day2 = dateObj2.getDate().toString().padStart(2, "0");
                const month = months[dateObj.getMonth()];
                const month2 = months[dateObj2.getMonth()];
                const year = dateObj.getFullYear();
                const year2 = dateObj2.getFullYear();
                coupon.expirydate = `${day}-${month}-${year}`;
                coupon.createddate = `${day2}-${month2}-${year2}`;
            })
            resolve(coupons);
        })
    },
    EditCouponPost: (couponId, coupon) => {
        return new Promise(async (resolve, reject) => {
            coupon.discount = Number(coupon.discount);
            coupon.expirydate = new Date(coupon.expirydate);
            coupon.status = true;
            const newDate = new Date();
            if (coupon.date < newDate) {
                coupon.status = 'EXPIRED';
            }
            const couponExist = await db.get().collection(collection.COUPON_COLLECTION)
                .findOne({ couponcode: coupon.couponcode });

            const couponID = new objectId(couponId)
            if (couponExist) {
                if (couponExist._id === couponID) {
                    resolve(null);
                } else {
                    db.get().collection(collection.COUPON_COLLECTION)
                        .updateOne({ _id: couponID },
                            {
                                $set: {
                                    couponcode: coupon.couponcode,
                                    discount: coupon.discount,
                                    expirydate: coupon.expirydate
                                }
                            }).then((response) => {
                                resolve();
                            })
                }
            }
            else {
                db.get().collection(collection.COUPON_COLLECTION)
                    .updateOne({ _id: couponID },
                        {
                            $set: {
                                couponcode: coupon.couponcode,
                                discount: coupon.discount,
                                expirydate: coupon.expirydate
                            }
                        }).then((response) => {
                            resolve();
                        })
            }

        })
    },
    DeleteCoupon: (couponId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: new objectId(couponId) }).then(() => {
                resolve()
            })
        })
    },
    AddBanner: (banner, callback) => {
        return new Promise((resolve, reject) => {
            banner.status = true;
            db.get().collection(collection.BANNER_COLLECTION)
                .insertOne(banner).then((data) => {
                    callback(data.insertedId);
                })
        })
    },
    UpdateBannerImages: (bannerId, bannerUrl) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
                .updateOne({ _id: new ObjectId(bannerId) },
                    {
                        $set:
                        {
                            image: bannerUrl
                        }
                    }).then((response)=>{
                        resolve(response)
                    })
        })
    },
    GetBanners: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION)
                .find().toArray();
            resolve(banner);
        })
    },
    BannerList: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
                .updateOne({ _id: new ObjectId(bannerId) },
                    {
                        $set:
                        {
                            status: true
                        }
                    }).then((response) => {
                        resolve();
                    })
        })
    },
    UnListbanner: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
                .updateOne({ _id: new ObjectId(bannerId) },
                    {
                        $set:
                        {
                            status: false
                        }
                    }).then((response) => {
                        resolve();
                    })
        })
    },
    DeleteBanner: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
                .deleteOne(
                    {
                        _id: new ObjectId(bannerId)
                    }
                ).then((response) => {
                    resolve()
                })
        })
    },
    GetCategoryCount: () => {
        return new Promise(async (resolve, reject) => {
            const category = await db.get().collection(collection.PRODUCT_CATEGORY).find({ categorystatus: true }).toArray()
            resolve(category.length)
        })
    },
    GetProductCount: () => {
        return new Promise(async (resolve, reject) => {
            const productCount = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({ productstatus: true })
            resolve(productCount)
        })
    },
    GetOrderCount: async () => {
        const orderCount = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({ status: 'deliverd' })
        return orderCount
    },
    GetTotalRevenue: async () => {
        const totalRevenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: {
                    status: 'deliverd'
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$GrandTotal'
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    "total": '$totalAmount'
                }
            }
        ]).toArray()
        return totalRevenue
    },
    MontlySales: async (startDate, endDate) => {
        const salesAmount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            { $match: { status: 'deliverd' } },
            { $match: { date: { $gte: startDate, $lt: endDate } } },
            { $group: { _id: null, total: { $sum: '$GrandTotal' } } },
        ]).toArray()
        return salesAmount
    },
    GetOrderStatics: () => {
        return new Promise(async (resolve, reject) => {
            const orderStatistics = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    }
                }

            ]).toArray()
            resolve(orderStatistics)
        })
    },
    GetSaleStatics: () => {
        return new Promise(async (resolve, reject) => {
            let saleStatistics = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                { $match: { 'status': 'deliverd' } },
                {
                    $group: {
                        '_id': { $month: '$date' },
                        'count': { '$sum': 1 }
                    }
                }
            ]).toArray()
            resolve(saleStatistics)
        })
    },
    GetAllSales: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        '$match': {
                            'status': 'deliverd'
                        }
                    },
                    {
                        '$lookup': {
                            'from': 'user',
                            'localField': 'userId',
                            'foreignField': '_id',
                            'as': 'userDetails'
                        }
                    }
                ]).toArray()
            console.log("orders", orders);
            resolve(orders)
        })
    },
    GetEditBanner: (bannerId) => {
        return new Promise(async (resolve, reject) => {
            const banner = await db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: new objectId(bannerId) })
            resolve(banner)
        })
    },
    EditBannerPost: (banner, bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
                .updateOne({ _id: new objectId(bannerId) },
                    {
                        $set: {
                            head: banner.head,
                            text: banner.text,
                        }
                    })
        })
    },
    salesreportfilterpost: (startDate, endDate) => {
        return new Promise(async (resolve, reject) => {
            try {
                const start = moment(startDate, 'YYYY-MM-DD').toDate();
                const end = moment(endDate, 'YYYY-MM-DD').toDate();

                // Check if the dates are valid
                if (!moment(start).isValid() || !moment(end).isValid()) {
                    throw new Error('Invalid date format');
                }

                const orders = await db.get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate([
                        {
                            $match: {
                                status: "deliverd",
                                date: {
                                    $gte: start,
                                    $lte: end,
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: 'user',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'userDetails',
                            },
                        },
                        {
                            $sort: {
                                date: -1,
                            },
                        },
                    ])
                    .toArray();

                resolve(orders);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    },
    WalletTransAdd: (userId, status, amount) => {
        return new Promise((resolve, reject) => {
            userId = new ObjectId(userId);
            const now = new Date();
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
            let transactions = []
            const transactionId = uuidv4(); 
            receipt = {
                transactionId: transactionId,
                source: status,
                date: date,
                amount: Number(amount)
            }
            transactions.push(receipt);
            db.get()
                .collection(collection.WALLET_COLLECTION)
                .updateOne(
                    { user: userId },
                    {
                        $push: {
                            transactions: receipt,
                        },
                    }
                )
                .then(() => {
                    resolve();
                })
                .catch(() => {
                    reject();
                })
        })
    }
}
