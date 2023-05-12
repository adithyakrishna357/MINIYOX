const db=require('../config/connection');
const collection=require('../config/collections');
const bcrypt=require('bcrypt');
const { get, response } = require('../app');
const { ObjectId } = require('mongodb');

module.exports={
    doSigUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.phone=Number(userData.phone);
            userData.isblocked=false;
            userData.password= await bcrypt.hash(userData.password,10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async(data)=>{
                dataDoc=await db.get().collection(collection.USER_COLLECTION).findOne({_id:data.insertedId});
                resolve(dataDoc);
            })
        })
        
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let Logginstatus=false;
            let response={}
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log("logged in");
                        response.user=user;
                        response.status=true;
                        resolve(response);
                    }
                    else{
                        console.log("password is not correct");
                        resolve({status:false})
                    }
                })
            }
            else{
                resolve({status:false})
            }
        })
    },
    viewProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            console.log(products);
            resolve(products);
        })
    },
    SinglrProductView:(productId)=>{
        return new Promise(async(resolve,reject)=>{
            let productdetails= await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: new ObjectId(productId)})
            console.log(productdetails);
            resolve(productdetails);
        })
        

    },
    otpnosend:(mobile)=>{
        return new Promise(async(resolve,reject)=>{
            // mobile=mobile.replace("+91","")
            mobile=Number(mobile)
            let response={}
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({phone:mobile})
            if(user){
                response.user=user;
                response.status=true;
                response.isBlocked=user.isblocked;
                resolve(response);
            }
            else{
                response.status=false;
                resolve(response);
                console.log(response);
            }
        })
    },
    GetCart:()=>{
        
    },
    AddCart:(productId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(productId,"/////////////////////////");
            let userdata= await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(userdata){

            }
            else{
                let cartobj={
                    user:ObjectId(userId),
                    products:[ObjectId(productId)]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne({cartobj}).then((response)=>{
                    resolve()
                })
            }
        })
    }
}