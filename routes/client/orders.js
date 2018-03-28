var express = require('express');
var router = express.Router();
const controller = require('../../controllers/client/orders');

//创建订单
router.put('/orderCreate', controller.createOrder);
//通过orderId查找订单信息
router.get('/', controller.getOrderById);
//用户订单列表
router.get('/notStartOrderList', controller.getUserAllNotStartOrderList);
router.get('/processingOrderList', controller.getuserAllProcessingOrderList);
router.get('/allCompletedOrderList', controller.getUserAllCompletedOrderList);

//护工订单列表
router.get('/notStartOrderListWork', controller.getWorkAllNotStartOrderList);
router.get('/processingOrderListWork', controller.getWorkAllProcessingOrderList);
router.get('/allCompletedOrderListWork', controller.getWorkAllCompletedOrderList);

//用户撤销订单
router.get('/cancelOrder/:orderId', controller.putOrdersIdCancel);
//判定是否到了订单开始那天
router.get('/canStartOrder/:orderId', controller.getCanStartOrder);
//护工操作订单开始
router.get('/startOrder/:orderId', controller.putOrdersIdStart);
//护工操作订单完结
router.get('/endOrder/:orderId', controller.putOrdersIdEnd);
//用户支付订单
router.get('/payOrder/:orderId', controller.getOrdersIdPay);
//用户评价订单
router.put('/:orderId/rating', controller.putOrdersIdRating);
//用户查看订单评价
router.get('/:orderId/rating', controller.getOrdersIdRating);





//护工待接单
//router.get('/workAvailableOrdersList', controller.getWorkAvailableOrdersList);




router.put('/orderEnd', controller.endOrder);
module.exports = router;
