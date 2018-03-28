var express = require('express');
var router = express.Router();

/* GET users listing. */
// const User = require('../../models').test;
// router.get('/', function(req, res, next) {
//   let id = 1;
//   User.queryById(id).then(function(users){
//       res.send('respond with a resourceindex111111111111111：'+res.jsonp(users));
//     });
// });

const controller = require('../../controllers/test/test');

router.get('/:testId', controller.getTestById); //查询
router.post('/', controller.postAddTest);  //增加
router.patch('/:testId', controller.patchUpdateTest); //局部更新
router.put('/:testId/updateEntity', controller.putUpdateTest); //全部分更新
router.delete('/:testId', controller.deleteTest); //删除

module.exports = router;
