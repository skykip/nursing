"use strict";
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/orders');
//通过userId获取订单信息yzl admin
router.get('/getOrderByUserId/:userId', controller.getUserOrderByUserId);
//通过workId获取订单信息yzl admin
router.get('/getOrderByWorkId/:workId', controller.getWorkOrderByWorkId);
//通过orderId获取各种信息yzl admin
router.get('/getOrderByOrderId/', controller.getUserOrderByOrderId);
//查询订单列表
router.post('/', controller.getAllOrders);
//更改订单价格
router.patch('/price/:orderId', controller.patchOrdersId);
//取消订单
router.put('/cancel/:orderId', controller.putOrdersIdCancel);
//完成订单
router.put('/endOrder/:orderId', controller.putOrdersIdEnd);
//查询未处理订单
router.post('/unprocessedOrders', controller.unprocessedOrders)


// router.post('/', controller.postOrders);

// router.get('/', controller.getOrders);

// router.get('/unresolved', controller.getUnresolvedOrders);

// router.get('/expiring', controller.getExpiringOrders);

// router.get('/:orderId', controller.getOrdersId);

// router.delete('/:orderId', controller.deleteOrdersId);

// router.patch('/:orderId', controller.patchOrdersId);

// //router.patch('/:orderId/pay', controller.dev_payStatus);

// router.get('/:orderId/rating', controller.getOrdersIdRating);

// router.put('/:orderId/rating', controller.putOrdersIdRating);

// router.delete('/:orderId/rating', controller.deleteOrdersIdRating);

// router.get('/:orderId/status', controller.getOrderStatusDetails);

// router.put('/:orderId/refund', controller.putOrdersIdRefund);

// router.put('/:orderId/substitute', controller.putOrdersIdSubstitute);

// router.put('/:orderId/restore', controller.putOrdersIdRestore);

// router.put('/:orderId/cancel', controller.putOrdersIdCancel);

// router.put('/:orderId/renew', controller.putOrdersIdRenew);

module.exports = router;
