const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
// const { get, response } = require('../app');
const { ObjectId } = require('mongodb');
const { response } = require('express');



module.exports ={
    ViewProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            console.log(products);
            resolve(products);
        })
    },
    SingleProductView: (productId) => {
        return new Promise(async (resolve, reject) => {
            let productdetails = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new ObjectId(productId) })
            console.log(productdetails);
            resolve(productdetails);
        })


    },
    GetProductCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.PRODUCT_CATEGORY).find().toArray()
            console.log(category);
            resolve(category);
        })
    },
    AddProduct_Post: (productData, callback) => {
        console.log(productData);
        // let category_obj=productData.product_category
        // productData.product_category=  new objectId(category_obj);
        console.log(productData.product_price, "ssssdhhotufcgvyhujkl//////////////////");
        productData.product_price = parseInt(productData.product_price)
        productData.stock = parseInt(productData.stock)
        productData.productstatus = true;
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data) => {
            // console.log(data);
            callback(data.insertedId);
        })
    },
    AddProduct_Img: (productId, imgUrl) => {
        return new Promise(async (resolve, reject) => {
            console.log(imgUrl);
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: new ObjectId(productId) },
                {
                    $set: { image: imgUrl }
                }).then((data) => {
                    resolve(data);
                })
        })
    },
    AdminProductView: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()

            console.log(products);
            resolve(products);
        })
    },
    GetEditProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            let editproduct = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new ObjectId(productId) })
            console.log(editproduct);
            resolve(editproduct);
        })
    },
    PostEditProduct: (productData, productId) => {
        return new Promise((resolve, reject) => {
            console.log(`new prodcuIdsjbv1111:  ${productId}`);
            productData.stock=parseInt(productData.stock)
            productData.product_price=parseInt(productData.product_price)
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: new ObjectId(productId) }, {
                $set: {
                    product_name: productData.product_name,
                    product_description: productData.product_description,
                    product_category: productData.product_category,
                    product_price: productData.product_price,
                    stock:productData.stock
                }
            })
                .then((response) => {
                    console.log(response)
                    resolve(response)
                })
                .catch((err) => {
                    console.log(err);
                })
        })
    },
    ListProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: new ObjectId(productId) },
                {
                    $set: {
                        productstatus: false
                    }
                }).then((response) => {
                    resolve();
                })
        })
    },
    UnlistProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: new ObjectId(productId) },
                {
                    $set: {
                        productstatus: true
                    }
                }).then((response) => {
                    resolve();
                })
        })
    },
}