const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('express');

module.exports = {
    ViewProducts: (currentPage) => {
        return new Promise(async (resolve, reject) => {
            currentPage = parseInt(currentPage)
            const limit = 8;
            const skip = (currentPage - 1) * limit;
            const products = await db.get().collection(collection.PRODUCT_COLLECTION).find()
                .skip(skip).limit(limit).toArray()
            resolve(products);
        })
    },
    SingleProductView: (productId) => {
        return new Promise(async (resolve, reject) => {
            const productdetails = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new ObjectId(productId) })
            resolve(productdetails);
        })
    },
    GetProductCategory: () => {
        return new Promise(async (resolve, reject) => {
            const category = await db.get().collection(collection.PRODUCT_CATEGORY).find().toArray()
            resolve(category);
        })
    },
    AddProduct_Post: (productData, callback) => {
        productData.product_price = parseInt(productData.product_price)
        productData.stock = parseInt(productData.stock)
        productData.product_category = new ObjectId(productData.product_category)
        productData.productstatus = true;
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data) => {
            callback(data.insertedId);
        })
    },
    AddProduct_Img: (productId, imgUrl) => {
        return new Promise(async (resolve, reject) => {
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
            const products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products);
        })
    },
    GetEditProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            const editproduct = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new ObjectId(productId) })
            resolve(editproduct);
        })
    },
    PostEditProduct: (productData, productId) => {
        return new Promise((resolve, reject) => {
            productData.stock = parseInt(productData.stock)
            productData.product_price = parseInt(productData.product_price)
            productData.product_category = new ObjectId(productData.product_category)
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: new ObjectId(productId) }, {
                $set: {
                    product_name: productData.product_name,
                    product_description: productData.product_description,
                    product_category: productData.product_category,
                    product_price: productData.product_price,
                    stock: productData.stock
                }
            })
                .then((response) => {
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
    GetFilteredPro: async (currentPage,filter) => {
        currentPage = parseInt(currentPage);
        const limit = 8;
        const skip = (currentPage - 1) * limit;
        if (filter === 'high') {
            filter = -1;
        } else if (filter === '₹0.00 - ₹1000.00') {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({ productstatus: true, product_price: { $gte: 0, $lte: 1000 } }).toArray();
            return products;
        } else if (filter === '₹1000.00 - ₹5000.00') {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({ productstatus: true, product_price: { $gte: 1000, $lte: 5000 } }).toArray();
            return products;
        } else if (filter === '₹5000.00 - ₹15000.00') {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({ productstatus: true, product_price: { $gte: 5000, $lte: 15000 } }).toArray();
            return products;
        } else if (filter === 'above15000') {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({ productstatus: true, product_price: { $gte: 15000 } }).toArray();
            return products;
        } else {
            filter = 1;
        }
        const products = await db.get().collection(collection.PRODUCT_COLLECTION)
            .find({ productstatus: true }).sort({ product_price: filter }).skip(skip).limit(limit).toArray();
        return products;
    },
    Search: (details) => {
        return new Promise(async (resolve, reject) => {
            try {
                const searchValue = details.search.search;
                const products = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                    'product_name': { $regex: `.*${searchValue}.*`, $options: 'i' }
                }).toArray();
                resolve(products)
            }
            catch (err) {
                reject(err);
            }
        })
    },
    GetFilterproductcount: async (filter) => {

        if (filter === 'high') {
            filter = -1;
        } else if (filter === '₹0.00 - ₹1000.00') {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({ productstatus: true, product_price: { $gte: 0, $lte: 1000 } }).toArray();
            return products;
        } else if (filter === '₹1000.00 - ₹5000.00') {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({ productstatus: true, product_price: { $gte: 1000, $lte: 5000 } }).toArray();
            return products;
        } else if (filter === '₹5000.00 - ₹15000.00') {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({ productstatus: true, product_price: { $gte: 5000, $lte: 15000 } }).toArray();
            return products;
        } else if (filter === 'above15000') {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({ productstatus: true, product_price: { $gte: 15000 } }).toArray();
            return products;
        } else {
            filter = 1;
        }
        const products = await db.get().collection(collection.PRODUCT_COLLECTION)
            .find({ productstatus: true }).sort({ product_price: filter }).toArray();
        return products;
    },
    
}