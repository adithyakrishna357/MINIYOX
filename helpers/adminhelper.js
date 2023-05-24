const db = require('../config/connection');
const collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const objectId = require('mongodb-legacy').ObjectId;



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
                    console.log("admin not  found");
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
        return Order
    },
    AddCoupon:(coupon)=>{
        return new Promise(async(resolve,reject) => {
            coupon.discount = Number(coupon.discount);
            coupon.expirydate = new Date(coupon.expirydate);
            coupon.status=true;
            const newDate = new Date();
            if(coupon.date < newDate) {
                coupon.status = 'EXPIRED';
            }
            else{
                coupon.createddate = newDate
            }
            const couponExist = await db.get().collection(collection.COUPON_COLLECTION)
            .findOne({ couponcode: coupon.couponcode});
            if(couponExist) {
                resolve(null);
            }else{
                db.get().collection(collection.COUPON_COLLECTION)
                .insertOne(coupon).then((response) => {
                resolve();
                })
            }   
        })
    },
    GetAllCoupons:()=>{
        return new Promise(async(resolve,reject)=>{
            const coupons = await db.get().collection(collection.COUPON_COLLECTION)
            .find().toArray();
            const newDate = new Date();
            coupons.forEach(coupon => {
                if(coupon.expirydate < newDate) {
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
    EditCouponPost:(couponId,coupon)=>{
        return new Promise(async(resolve,reject) => {
            coupon.discount = Number(coupon.discount);
            coupon.expirydate = new Date(coupon.expirydate);
            coupon.status=true;
            const newDate = new Date();
            if(coupon.date < newDate) {
                coupon.status = 'EXPIRED';
            }
            const couponExist = await db.get().collection(collection.COUPON_COLLECTION)
            .findOne({ couponcode: coupon.couponcode});
            if(couponExist) {
                resolve(null);
            }else{
                db.get().collection(collection.COUPON_COLLECTION)
                .updateOne({_id: new objectId(couponId)},
                    {
                        $set:{
                            couponcode:coupon.couponcode,
                            discount:coupon.discount,
                            expirydate:coupon.expirydate
                        }
                    }).then((response) => {
                resolve();
                })
            }   
        })
    },
    DeleteCoupon:(couponId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id: new objectId(couponId)}).then(()=>{
                resolve()
            })
        })
    },
    AddBanner: (banner,callback) => {          
        return new Promise((resolve, reject) => {
            banner.status=true;
            db.get().collection(collection.BANNER_COLLECTION)
            .insertOne(banner).then((data) => {
            callback(data.insertedId);
            })
        })
    },
    UpdateBannerImages: (bannerId,bannerUrl) => {       
        return new Promise((resolve,reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .updateOne({_id: new ObjectId(bannerId)},
            {
                $set: 
                    {
                        image: bannerUrl
                    }
            })
        }) 
    },
    GetBanners: () => {    
        return new Promise(async(resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION)
            .find().toArray();
            resolve(banner);
        })
    },
    BannerList:(bannerId) => {    
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .updateOne({_id: new ObjectId(bannerId)},
            {
                $set:
                {
                    status:true
                }
            }).then((response) => {
                resolve();
            })
        })
    },
    UnListbanner:(bannerId) => {    
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .updateOne({_id: new ObjectId(bannerId)},
            {
                $set:
                {
                    status:false
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
    }
}
