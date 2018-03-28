"use strict";

const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/hospitals');

// router.get('/', controller.getHospitals);
// router.post('/', controller.postHospitals);
// router.get('/:hospitalId', controller.getHospitalsId);
// router.patch('/:hospitalId', controller.patchHospitalsId);
// router.delete('/:hospitalId', controller.deleteHospitalsId);

router.get('/', controller.getHospitalsget);//get查询医院信息(state/city/region)√√√
router.get('/state/', controller.getHospitalsStateget);//get获取所有数据库已有省份√√
router.get('/city/', controller.getHospitalsCityget);//get获取所有数据库已有市√√
router.get('/getregion/', controller.getRegions);//get获取所有数据库已有区√√

router.get('/likeSearchHospitalName/', controller.getLikeSearchHospitalName);//通过医院名字模糊查询医院信息√√
router.post('/addHospital/', controller.postAddHospital);  //增加医院√√
router.delete('/deleteHospital/:hospitalId', controller.deleteHospitalById); //删除医院√√
//router.put('/updateHospital/:hospitalId', controller.putUpdateHospital); //通过id全部更新医院信息√√
router.patch('/updateHospital/:hospitalId', controller.patchUpdateHospital); //通过id局部更新医院信息√√

module.exports = router;
