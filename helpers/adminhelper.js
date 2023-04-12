const db=require('../config/connection');
const collection=require('../config/collections');
const bcrypt=require('bcrypt');
const Id = require('objectid');
const { response } = require('../app');
const objectId = require('mongodb-legacy').ObjectId;
// const { Collection, ObjectID } = require('mongodb');
// var objectId = require('mongodb').ObjectID


module.exports={
    adminLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={};
            console.log(adminData);
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.username});
            console.log(admin,'oooooooooooooooooooooooooooooooooooo');
            if(admin){
                if(admin.password==adminData.password){
                    response.admin=admin;
                    response.adminname=admin.name;
                    response.status=true;
                    resolve(response);
                }
                else{
                    console.log("admin not  found");
                    resolve({status:false})
                }
            }
        
        })

    },
    addproduct_post:(productData,callback)=>{
        console.log(productData);
        // let category_obj=productData.product_category
        // productData.product_category=  new objectId(category_obj);
        productData.productstatus=true;
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data)=>{
            console.log(data);
            callback(data.insertedId);
        })
    },
    addproduct_img:(productId,imgUrl)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(imgUrl);
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(productId)},
                {
                    $set:{image: imgUrl}
                }).then((data)=>{
                    resolve(data);
                })
        })
    },
    addcategory_post:(categoryData)=>{
        console.log(categoryData);
        categoryData.categorystatus=true;
        db.get().collection(collection.PRODUCT_CATEGORY).insertOne(categoryData)
    },
    adminproductview:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()

            console.log(products);
            resolve(products);
        })
    },
    addproductcategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let category = await db.get().collection(collection.PRODUCT_CATEGORY).find().toArray()
            console.log(category);
            resolve(category);
        })
    },
    adminuserlistview:()=>{
        return new Promise(async(resolve,reject)=>{
            let user= await db.get().collection(collection.USER_COLLECTION).find().toArray()
            console.log(user);
            resolve(user);
        })
    },
    getEditProduct:(productId)=>{
        return new Promise(async(resolve,reject)=>{
            let editproduct = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: new objectId(productId)})
            console.log(editproduct);
            resolve(editproduct);
        })
    },
    PostEditProduct:(productData, productId)=>{
        return new Promise((resolve,reject)=>{
            console.log(`new prodcuIdsjbv1111:  ${productId}`);
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: new objectId(productId)},{
                $set:{
                    product_name:productData.product_name,
                    product_description:productData.product_description,
                    product_category:productData.product_category,
                    product_price:productData.product_price
                }
                })
                .then((response)=>{
                    console.log(response)
                    resolve(response)
                })
                .catch((err)=>{
                    console.log(err);
                })
        })
    },
    // Geteditcategory:(categoryId)=>{
    //     return new Promise((resolve,reject)=>{
    //         let editcategory=db.get().collection(collection.PRODUCT_CATEGORY).findOne({_id: new objectId(categoryId)})
    //         console.log(editcategory);
    //         resolve(editcategory);
    //     })
    // },
    Posteditcategory:(categoryData,categoryId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_CATEGORY).updateOne({_id: new objectId(categoryId)},{
                $set:{
                    category_list:categoryData.category_list
                }
            }).then((response)=>{
                console.log(response);
                resolve(response);
            })
        })
    },
    ListCategory:(categoryId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_CATEGORY).updateOne({_id: new objectId(categoryId)},
            {
                $set:{
                    categorystatus:false
                }
            }).then((response)=>{
                resolve();
            })
        })
    },
    UnlistCategory:(categoryId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_CATEGORY).updateOne({_id: new objectId(categoryId)},
            {
                $set:{
                    categorystatus:true
                }
            }).then((response)=>{
                resolve();
            })
        })
    },
    ListProduct:(productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: new objectId(productId)},
            {
                $set:{
                    productstatus:false
                }
            }).then((response)=>{
                resolve();
            })
        })
    },
    UnlistProduct:(productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: new objectId(productId)},
            {
                $set:{
                    productstatus:true
                }
            }).then((response)=>{
                resolve();
            })
        })
    },
    UnBlockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: new objectId(userId)},
            {
                $set:{
                    isblocked:true
                }
            }).then((response)=>{
                resolve();
            })
        })
    },
    BlockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: new objectId(userId)},
            {
                $set:{
                    isblocked:false
                }
            }).then((response)=>{
                resolve();
            })
        })
    }
}