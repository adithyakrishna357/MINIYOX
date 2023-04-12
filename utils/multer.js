const multer = require('multer');
const path= require('path');

module.exports=multer({
    storage: multer.diskStorage({}),
    filefilter:(req, file, cb)=>{
      let ext=path.extname(file.orginalname);
      if(ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !==".webp"){
          cb(new Error("File is not Supported"),false);
          return;
      }
      cb(null,true)
    }
})