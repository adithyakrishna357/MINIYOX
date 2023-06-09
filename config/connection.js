// let MongoClient=require('mongodb').MongoClient
// let state={
//     db:null
// }
// module.exports.connect=function(done){
//     let url='mongodb://0.0.0.0:27017'
//     let dbname= 'Toys'

//     MongoClient.connect(url, (err, data)=>{
//         if(err) return done(err)
//         state.db = data.db(dbname)
//         done()
//     })
// }
// module.exports.get=function(){
//     return state.db;
// }
//change mongodb version "mongodb": "^5.1.0" to "mongodb": "^4.14.0" in package.json, then again run "npm i"


const { MongoClient } = require('mongodb-legacy');
const state={
    db:null
}

module.exports.connect=(done)=>{
    const url = 'mongodb://127.0.0.1:27017';
    const dbname = 'Miniature';

    MongoClient.connect(url,(err,data)=>{          //connecting to mongodb
        if(err) return console.log(err)
        state.db=data.db(dbname);

        done();
    })
}

module.exports.get=() => state.db;