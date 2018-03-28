var express = require('express');
var router = express.Router();

const controller = require('../../controllers/client/prices');



router.post('/', controller.postQueryPrice); // 按照post条件查找价格


module.exports = router;
