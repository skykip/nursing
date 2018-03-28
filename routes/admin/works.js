"use strict";

const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/works');

//管理员查找待认证护工(基本信息和认证信息都完成)列表
router.get('/getCheckingWorksList',  controller.getCheckingWorksList);
//管理员查找已经完善了信息，但是没有提交认证的护工列表
router.get('/getBasicInfoWorksList',  controller.getBasicInfoWorksList);
//管理员查找未通过审核的护工列表
router.get('/getDisapproveWorksList',  controller.getDisapproveWorksList);

//管理员查找所有护工信息
router.post('/allWorks',  controller.getAllWorks);
//管理员查找已回收的护工
router.post('/deletedWorks', controller.getWorksDeleted);
//管理员回收护工(删除护工)
router.delete('/:workId', controller.deleteWorksId);
//管理员恢复回收护工(恢复护工)
router.put('/:workId/restore', controller.restoreWorksId);
//管理员修改用户信息
router.patch('/:workId', controller.patchWorksId);


//通过审核
router.put('/:workId/approve',  controller.approveWorksId);
//不通过审核
router.put('/:workId/disapprove', controller.disapproveWorksId);
//通过Id查找护工信息
router.get('/:workId', controller.getWorksId);

// router.get('/', controller.getWorks);
// router.get('/deleted', controller.getWorksDeleted);
// router.get('/available', controller.getWorksAvailable);
// router.post('/',  controller.postWorks);
// router.get('/:workId', controller.getWorksId);
// router.delete('/:workId', controller.deleteWorksId);
// router.put('/:workId/restore', controller.restoreWorksId);
// router.put('/:workId/change', controller.putWorksIdChange);
// router.get('/:workId/payment-method', controller.getPaymentMethod);
// router.put('/:workId/payment-method', controller.putPaymentMethod);
// router.delete('/:workId/payment-method', controller.deletePaymentMethod);
// router.get('/:workId/service', controller.getService);
// router.put('/:workId/service', controller.putService);
// router.put('/:workId/punishment', controller.putWorkPunishment);
// router.put('/:workId/cancelpunishment', controller.putWorkPunishmentCancel);
// router.patch('/:workId', controller.patchWorksId);
// router.patch('/:workId/service', controller.patchService);
// router.patch('/:workId/avatar', controller.patchAvatar);
// router.patch('/:workId/changeprice', controller.patchPrices);
// router.patch('/changeprice', controller.patchBulkPrices);
module.exports = router;
