const db = require('../config/connection');
const collection = require('../config/collections');
// const bcrypt = require('bcrypt');
// const Id = require('objectid');
// const { orderdetails } = require('../controllers/admincontrollers');
const objectId = require('mongodb-legacy').ObjectId;

module.exports={
    AddCategory_Post: (categoryData) => {
        console.log(categoryData);
        categoryData.categorystatus = true;
        db.get().collection(collection.PRODUCT_CATEGORY).insertOne(categoryData)
    },
    AdminProductCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.PRODUCT_CATEGORY).find().toArray()
            console.log(category);
            resolve(category);
        })
    },
    PostEditCategory: (categoryData, categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_CATEGORY).updateOne({ _id: new objectId(categoryId) }, {
                $set: {
                    category_list: categoryData.category_list
                }
            }).then((response) => {
                console.log(response);
                resolve(response);
            })
        })
    },
    ListCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_CATEGORY).updateOne({ _id: new objectId(categoryId) },
                {
                    $set: {
                        categorystatus: false
                    }
                }).then((response) => {
                    resolve();
                })
        })
    },
    UnlistCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_CATEGORY).updateOne({ _id: new objectId(categoryId) },
                {
                    $set: {
                        categorystatus: true
                    }
                }).then((response) => {
                    resolve();
                })
        })
    },
}