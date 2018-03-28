var  multer=require('multer');
var fs = require('fs');
var moment = require('moment');
var uuid = require('node-uuid');

var createFolder = function(folder){
    try{
        fs.accessSync(folder); 
    }catch(e){
        fs.mkdirSync(folder);
    }  
};
var uploadFolder = './public/images/uploadsWorkAvatar/';

createFolder(uploadFolder);
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + moment().format('YYYY-MM-DD-')+uuid.v1()+ '.jpeg');
    }
  });
  var upload = multer({ storage: storage });
  module.exports = upload;
