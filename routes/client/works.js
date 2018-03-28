var express = require('express');
//var moment = require('moment');
var router = express.Router();
const controller = require('../../controllers/client/works');
//添加上传文件模块
const avatarUpload = require('../../utils/avatarMulterUtil');
const authUpload = require('../../utils/authMulterUtil');

router.post('/list', controller.listWorks); // 按照post条件来搜索护工列表，包括分页
router.get('/history', controller.getWorkHistory);  //通过护工id来获得护工的历史服务记录


// 按照post条件来查找可用护工列表，包括分页yzl
router.post('/availableWorks', controller.postAvailableWorks); 
//护工提交审核照片yzl
router.post('/authWork',authUpload.array('workAuth',3), controller.postAuthWork);
//护工注册（信息补全)yzl
router.post('/addWork',avatarUpload.single('workAvatar'), controller.postAddWork);
//局部更新yzl
router.post('/updateWork',avatarUpload.single('workAvatar'),controller.postUpdateWork); 


//护工接单设置###########################
//护工查看接单开关状态
router.get('/getWorkStatus/:userId',controller.getWorkStatus);
//护工查看接单设置详情
router.get('/:workId/service', controller.getService);
//护工更改接单状态
router.patch('/:workId/service', controller.patchService);
//护工更改接单设置
router.put('/:workId/service', controller.putService);

//护工钱包设置########################
router.get('/:workId/payment-method', controller.getPaymentMethod);//查看
router.put('/:workId/payment-method', controller.putPaymentMethod);//设置
router.delete('/:workId/payment-method', controller.deletePaymentMethod);//删除

//router.get('/isWork/:userId',controller.getisWork); //判断当前用户是不是护工yzl
//判断护工是否已经审核通过yzl
router.get('/isAuthWork/:userId',controller.getisAuthWork);
//判断护工是否已经完善个人信息yzl
router.get('/isBasicInfoWork/:userId',controller.getisBasicInfoWork); 

router.get('/:workId', controller.getWorkById); // 按照护工id来获得单个护工信息
// router.put('/:testId/updateEntity', controller.putUpdateTest); //全部分更新
router.delete('/:workId', controller.deleteWork); //删除



module.exports = router;
