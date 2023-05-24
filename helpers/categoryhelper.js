const db = require('../config/connection');
const collection = require('../config/collections');
const objectId = require('mongodb-legacy').ObjectId;

module.exports = {
    AddCategory_Post: (categoryData) => {
        return new Promise(async (resolve, reject) => {
            const categoryexists = await db.get().collection(collection.PRODUCT_CATEGORY).findOne({
                category_list: { $regex: `^${categoryData.category_list}$`, $options: 'i' }
            })
            if (categoryexists) {
                resolve({ status: false });
            } else {
                categoryData.categorystatus = true;
                db.get().collection(collection.PRODUCT_CATEGORY).insertOne(categoryData)
                resolve({status:true})
            }
        })
    },
    AdminProductCategory: () => {
        return new Promise(async (resolve, reject) => {
            const category = await db.get().collection(collection.PRODUCT_CATEGORY).find().toArray()
            resolve(category);
        })
    },
    PostEditCategory: (categoryData, categoryId) => {
        return new Promise(async(resolve, reject) => {
            const categoryexist = await db.get().collection(collection.PRODUCT_CATEGORY).findOne({
                category_list: { $regex: `^${categoryData}$`, $options: 'i' }
            })
            if (categoryexist) {
                resolve({ status: false });
            } else {
                db.get().collection(collection.PRODUCT_CATEGORY).updateOne({ _id: new objectId(categoryId) }, {
                    $set: {
                        category_list: categoryData
                    }
                })
                resolve({status:true})
            }
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