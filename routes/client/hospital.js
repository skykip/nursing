var express = require('express');
var router = express.Router();
// const controller = require('../../controllers/client/users');
// router.post('/:userId', controller.getUserById);

var controller = require('../../controllers/client/hospital');
// router.get("/",function(req,res){
//     res.render('index');
//   });
//√前台用 √√后台用 √√√前后台都用
router.get('/', controller.getHospitalsget);//get查询医院信息(state/city/region)√√√
router.post('/', controller.getHospitalspost);//post查询医院信息(state/city/region)
router.get('/hospitalName/', controller.getHospitalsNameget);//get查询医院名称(state/city/region)√

router.get('/state/', controller.getHospitalsStateget);//get获取所有数据库已有省份√√
router.get('/city/', controller.getHospitalsCityget);//get获取所有数据库已有市√√
router.get('/region/', controller.getHospitalsRegionget);//get获取所有数据库已有区√
router.get('/getregion/', controller.getRegions);//get获取所有数据库已有区√√

router.get('/distance/', controller.getHospitalsDistance);//获取到最近医院√
router.get('/likeSearchHospitalName/', controller.getLikeSearchHospitalName);//通过医院名字模糊查询医院信息√√

router.post('/addHospital/', controller.postAddHospital);  //增加医院√√
router.get('/:hospitalId', controller.getHospitalsId); //通过id查询医院信息(hospitalId)√√√
router.delete('/deleteHospital/:hospitalId', controller.deleteHospitalById); //删除医院√√
//router.put('/updateHospital/:hospitalId', controller.putUpdateHospital); //通过id全部更新医院信息√√
router.patch('/updateHospital/:hospitalId', controller.patchUpdateHospital); //通过id局部更新医院信息√√

// router.get('/q/:state',controller.getHospitalsState);
// router.get('/d/:state&:city&:region',controller.getHospitalsStateCityRegion);
//router.get('/d/?state=:state&city=:city&region=:region',controller.getHospitalsStateCityRegion);


// router.get('/', function(req, res, next) {
//     console.log("所有医院");
//     res.send("hospital");
// });

module.exports = router;
