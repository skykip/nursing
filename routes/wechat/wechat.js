/**
 * wechat.js
 * Created by haroldsong on 16/4/3.
 * Copyright (c) 2016 Tencent Inc. All rights reserved.
 * Description:微信请求的路由
 */

var _ = require('lodash');
var express = require('express');
var router = express.Router();
var co = require('co');
// var signature = require('wx_jsapi_sign');
var wechat = require('wechat');
var wxapi = require('../../lib/wxapi.js');

var config = require('../../config/config');
var customerConfig = config['wechat']['customer'];
var workerConfig = config['wechat']['worker'];
var customerToken = customerConfig.token;
var workerToken = workerConfig.token;

// var payHelper = require('../../lib/payHelper');

// var workerCheckIn = require('../../business/workerCheckIn');
// var workerService = require('../../business/workerService');

// var Model = require('../../models/index');
// var Communication = Model.communication;
// var WeChatLocation = Model.wechatLocation;
// var OrderStatus = Model.orderStatus;
// var OrderWork = Model.orderWork;
// var Payment = Model.payment;
// var Message = Model.message;
// var Worker = Model.work;
// var Order = Model.order;
// var User = Model.user;
// var Supervision = Model.supervision;

// var scheduleTask = require('../../lib/scheduleTask');

// var Templates = require('../../data/wxTemplateMsg');

// var redisClient = require('../../lib/redisClient').client;

router.get('/getWechatMenu',  function (req, res, next) {

    wxapi.getWechatMenu(function (err, newContent) {

    });
});

router.get('/createWechatMenu',  function (req, res, next) {

    wxapi.createWechatMenu(function (err, newContent) {

    });
});

router.get('/removeWechatMenu',  function (req, res, next) {

    wxapi.removeWechatMenu(function (err, newContent) {

    });
});

// router.post('/signature4customer', function (req, res, next) {
//     var url = decodeURIComponent(req.body.url);
//     signature.getSignature(customerConfig)(url, function (error, result) {
//         if (error) {
//             return next(error);
//         } else {
//             return res.jsonp(result);
//         }
//     });
// });

// router.post('/signature4worker', function (req, res, next) {
//     var url = decodeURIComponent(req.body.url);
//     signature.getSignature(workerConfig)(url, function (error, result) {
//         if (error) {
//             return next(error);
//         } else {
//             return res.jsonp(result);
//         }
//     });
// });

router.get('/customer', wechat(customerToken, function (req, res, next) {


}));

router.get('/worker', wechat(workerToken, function (req, res, next) {
    
}));

// var msgHandler4Worker = function (workerOpenId, content, type) {
//     co(function*() {
//         var communication = yield Communication.findOne(
//             {
//                 where: {
//                     workerOpenId: workerOpenId,
//                     status: Communication.STATUS_ACTIVE
//                 }
//             });

//         if (communication && communication.customerOpenId) {
//             wxapi.sendMsg2Customer(communication.customerOpenId, content, type, function (err, newContent) {
//                 co(function*() {
//                     var msgStatus = communication.status === Communication.STATUS_ACTIVE ? "finish" : "pending";
//                     var msg = Message.build(
//                         {
//                             fromOpenId: workerOpenId,
//                             toOpenId: communication.customerOpenId,
//                             content: newContent,
//                             status: msgStatus
//                         });
//                     msg = yield msg.save();
//                 }).catch(function (e) {
//                     console.log(e);
//                 });
//             });
//         }
//     }).catch(function (e) {
//         console.log(e);
//     });
// };

//var msgHandler4Customer = function(customerOpenId, content, type) {
//    co(function* () {
//        var communication = yield Communication.findOne(
//            {
//                where:
//                {
//                    customerOpenId: customerOpenId
//                }
//            });
//
//        wxapi.sendMsg2Worker(communication.workerOpenId, content, type, function(err, newContent) {
//            co(function* () {
//                var msgStatus = communication.status === "active" ? "finish" : "pending";
//                var msg = Message.build(
//                    {
//                        fromOpenId: customerOpenId,
//                        toOpenId: communication.workerOpenId,
//                        content: newContent,
//                        status: msgStatus
//                    });
//                msg = yield msg.save();
//            }).catch(function(e) {
//                console.log(e);
//            });
//        });
//    }).catch(function(e) {
//        console.log(e);
//    });
//};

// var workerStatusHandler = function (workerOpenId) {
//     return co(function*() {
//         var user_worker = yield User.findOne(
//             {
//                 where: {
//                     openId: workerOpenId
//                 }
//             });
//         if (user_worker) {
//             var worker = yield Worker.findOne(
//                 {
//                     where: {
//                         userId: user_worker.id
//                     }
//                 });
//             if (worker) {
//                 switch (worker.status) {
//                     case Worker.STATUS_CHECKING:
//                         return {
//                             success: false,
//                             msg: "您的护工申请还在审核中, 请耐心等待"
//                         };
//                     case Worker.STATUS_DISAPPROVED:
//                         return {
//                             success: false,
//                             msg: "很抱歉, 您未通过我们的护工资格审核"
//                         };
//                     case Worker.STATUS_APPROVED:
//                         return {
//                             success: true,
//                             msg: "欢迎您, 您是我们的一员"
//                         }
//                 }
//             } else {
//                 return {
//                     success: false,
//                     msg: [{
//                         title: '您还不是我们的护工',
//                         url: config.url + '/worker.html#!/benurse',
//                         description: '快快点击去注册成为我们的护工吧'
//                     }]
//                 };
//             }
//         } else {
//             return {
//                 success: false,
//                 msg: [{
//                     title: '您还不是我们的护工',
//                     url: config.url + '/worker.html#!/auth',
//                     description: '快快点击去注册成为我们的护工吧'
//                 }]
//             };
//         }

//     }).catch(function (e) {
//         console.log(e);
//     });
// };

// /*
//  //customer
//  */

router.post('/customer', wechat(customerToken,
    wechat.text(function (message, req, res, next) {
        //if (message.Content === '1') {
        //    co(function*() {
        //        var communication = yield Communication.findOne(
        //            {
        //                where: {
        //                    customerOpenId: message.FromUserName
        //                }
        //            });
        //        if (communication) {
        //            if (communication.status == "inactive") {
        //                communication.status = "active";
        //                communication = yield communication.save();
        //            }
        //            res.reply('你会收到今天的护工照看情况');
        //            wxapi.sendMsg2Worker(communication.workerOpenId, "客户需要知道照看情况", "text", function (err, newContent) {
        //
        //            });
        //        } else {
        //            res.reply('');
        //        }
        //    }).catch(function (e) {
        //        console.log(e);
        //    });
        //} else {
        //    res.reply('');
        //}
        res.reply('');
    }).image(function (message, req, res, next) {
        res.reply('');
    }).voice(function (message, req, res, next) {
        res.reply('');
    }).shortvideo(function (message, req, res, next) {
        res.reply('');
    }).event(function (message, req, res, next) {
        if (message.Event === 'subscribe') {
            res.reply('欢迎来到快康护理');
        } else {
            console.log(message);
            res.reply('');
        }
    })
));

// /**
//  *
//  //worker
//  {
//     EventKey:
//     {
//         "签到":"WORKER_CHECK_IN"
//         "工作日程":"WORKER_SCHEDULE"
//     }
//  }
//  */

// router.post('/worker', wechat(workerToken,
//     wechat.text(function (message, req, res, next) {
        // if (message.Content === 's') {
//             res.reply([
//                 {
//                     title: '欢迎你',
//                     description: '欢迎你的加入, 快去验证手机号',
//                     picurl: 'http://open.web.meitu.com/sources/images/1.jpg',
//                     url: config.url + '/supervisor.html#!/login'
//                 }
//             ]);
//         } else if (message.Content === '排班') {
//             co(function *() {
//                 var supervision = yield Supervision.findOne({
//                     include: {
//                         model:User,
//                         where: {
//                             openId: message.FromUserName
//                         }
//                     }
//                 });
//                 if(supervision) {
//                     redisClient.get("hospital" + supervision.hospitalId, function(err, reply) {
//                         var content = [].concat(_.map(JSON.parse(reply), function(worker) {
//                             return worker.name + "(" + worker.orderCount + ")";
//                         }));
//                         res.reply(content.join("\n"));
//                     });
//                 } else {
//                     res.reply("抱歉，您没有权利查看排班信息");
//                 }
//             }).catch(function(err) {
//                 console.log(err);
//             });
//         } else {
//             //msgHandler4Worker(message.FromUserName, message.Content, 'text');
//             res.reply('后台业务变更，发送消息给客户功能已经中止');
//         }
//     }).image(function (message, req, res, next) {
//         msgHandler4Worker(message.FromUserName, message.MediaId, 'image');
//         res.reply('');
//     }).voice(function (message, req, res, next) {
//         msgHandler4Worker(message.FromUserName, message.MediaId, 'voice');
//         res.reply('');
//     }).shortvideo(function (message, req, res, next) {
//         msgHandler4Worker(message.FromUserName, message.MediaId, 'video');
//         res.reply('');
//     }).event(function (message, req, res, next) {
//         if (message.Event === 'subscribe') {
//             res.reply('欢迎来到快康护理-护工端');
//         } else if (message.Event === 'CLICK') {
//             co(function*() {
//                 var result = yield workerStatusHandler(message.FromUserName);
//                 if (result.success) {
//                     var templateMsg;
//                     var order;
//                     switch (message.EventKey) {
//                         case "WORKER_CHECK_IN":
//                             var checkInResult = yield workerCheckIn.checkin(message.FromUserName, new Date(message.CreateTime * 1000));
//                             if (checkInResult.success) {
//                                 for (var index = 0; index < checkInResult.data.length; ++index) {
//                                     templateMsg = Templates.cRemainder(checkInResult.data[index]);
//                                     wxapi.sendTemplateMsg2Customer(checkInResult.data[index].openId, templateMsg.templateId, templateMsg.url, templateMsg.data);
//                                 }
//                                 res.reply(checkInResult.msg);
//                             }
//                             else {
//                                 if (checkInResult.exception) {
//                                     /*
//                                     * {"media_id":"4U4R0n1NgJ0N4yDRPbMDU-UWxqDczQdQdNM41S3AgQc","url":"http:\/\/mmbiz.qpic.cn\/mmbiz_jpg\/OfbovFvMvzFfALqJ8OMWntdkOo5ibKn7zfwrE7wQNBflRwoo5DP3fVotG6JHh6Pia7S8gh8IMgSuae4kT8WyeWrA\/0?wx_fmt=jpeg"}
//                                     * */
//                                     res.reply({
//                                         type: "image",
//                                         content: {
//                                             mediaId: '4U4R0n1NgJ0N4yDRPbMDU-UWxqDczQdQdNM41S3AgQc'
//                                         }
//                                     });
//                                 } else {
//                                     res.reply(checkInResult.msg);
//                                 }
//                             }
//                             break;
//                         case "WORKER_START_ORDER":
//                             var acceptResult = yield workerService.accept(message.FromUserName);
//                             if (acceptResult.success) {
//                                 res.reply(Templates.wAccept('开始接单', '可以点击修改接单要求'));
//                             } else {
//                                 res.reply(Templates.wAccept('还无法接单', '第一次接单需要设置接单要求'));
//                             }
//                             break;
//                         case "WORKER_STOP_ORDER":
//                             yield workerService.reject(message.FromUserName);
//                             res.reply('已经停止接单, 不会再接到任何新订单请求');
//                             break;
//                         case "WORKER_SCHEDULE":
//                             order = yield Order.findByWorkerOpenIdAndStatus(message.FromUserName, [Order.STATUS_SIGNED, Order.STATUS_PROGRESSING]);
//                             if (order.length > 0) {
//                                 var timeMap = {
//                                     "day": '白班',
//                                     "night": '夜班',
//                                     "dayNight": '24小时班'
//                                 };
//                                 var startDate = order[0].startDate;
//                                 var endDate = order[0].endDate;
//                                 for (var i = 1; i < order.length; ++i) {
//                                     var start = order[i].startDate;
//                                     var end = order[i].endDate;
//                                     if (start < startDate) startDate = start;
//                                     if (end > endDate) endDate = end;
//                                 }
//                                 res.reply(Templates.dateF(startDate) + ' 至 ' + Templates.dateF(endDate) + ' 有 ' + timeMap[order[0].nursingTime]);
//                             } else {
//                                 res.reply('您近期没有工作安排');
//                             }
//                             break;
//                     }
//                 } else {
//                     res.reply(result.msg);
//                 }
//             }).catch(function (e) {
//                 console.log(e);
//             });
//         } else if (message.Event === 'LOCATION') {
//             co(function*() {
//                 var wxLocation = WeChatLocation.build(
//                     {
//                         openId: message.FromUserName,
//                         date: new Date(message.CreateTime * 1000),
//                         longitude: message.Longitude,
//                         latitude: message.Latitude
//                     });
//                 wxLocation = yield wxLocation.save();
//             }).catch(function (e) {
//                 console.log(e);
//             });
//             res.reply('');
//         }
//     })
// ));

// router.post('/customer/pay/notify', payHelper.customer.useWXPayCallback(function (msg, req, res, next) {
//     co(function *() {
        
//         if (msg.result_code !== 'SUCCESS') {
//             return res.fail();
//         }
        
//         var tradeNum = msg.out_trade_no;
//         var openId = msg.openid;
//         var user = yield User.queryByOpenId(openId);
//         var order = yield Order.queryByTradeNum(tradeNum);
//         if (!order) {
//             console.log("Order with tradeNum " + tradeNum + " not found");
//             return res.fail();
//         }
//         if (order.status !== Order.STATUS_UNPAID) {
//             console.log("Order paid already");
//             return res.fail();
//         }
//         if (!user) {
//             console.log("User with openId " + openId + " not found");
//             return res.fail();
//         }
//         if (user.id !== order.customerId) {
//             console.log("Order is not belongs to user " + user.id);
//             return res.fail();
//         }

//         yield order.update({
//             status: Order.STATUS_PAID
//         });

//         var payment = yield Payment.create({
//             payerId: user.id,
//             orderId: order.id,
//             object: msg
//         });
//         yield order.addPayment(payment);

//         yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_PAID, user.id);

//         var orderSigned = (yield Order.update({
//             status: Order.STATUS_SIGNED
//         }, {
//             where: {
//                 id: order.id,
//                 status: Order.STATUS_PAID,
//                 workId: {
//                     $ne: null
//                 }
//             }
//         }))[0];

//         if (orderSigned) {
//             yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_SIGNED);
//             scheduleTask.tempTask(order);
//         }

//         res.success();
//     }).catch(function (err) {
//         return next(err);
//     });
// }));

// router.post('/worker/pay/notify', payHelper.worker.useWXPayCallback(function (msg, req, res, next) {
//     co(function *() {

//         if (msg.return_code !== 'SUCCESS' || msg.result_code !== 'SUCCESS') {
//             return res.fail();
//         }
        
//         var tradeNum = msg.out_trade_no;
//         var openId = msg.openid;
//         var user = yield User.queryByOpenId(openId);
//         var order = yield Order.queryByTradeNum(tradeNum);
//         var payment;

//         if (!order) {
//             console.log("Order with tradeNum " + tradeNum + " not found");
//             return res.fail();
//         }
//         if (order.status !== Order.STATUS_UNPAID) {
//             console.log("Order paid already");
//             var payments = yield order.getPayments();
//             if (payments && payments.length > 0) {
//                 payment = payments[0];
//                 if (payment.object.transaction_id === msg.transaction_id) {
//                     // 流水号相同, 可能是微信没有收到上次的确认信息, 重发
//                     return res.success();
//                 }
//             }
//             return res.fail();
//         }
//         if (!user) {
//             console.log("User with openId " + openId + " not found");
//             return res.fail();
//         }

//         var supervision = yield user.getSupervision();
//         if (!supervision || supervision.hospitalId !== order.hospitalId) {
//             console.log("User with openId " + openId + " is not supervision");
//             return res.fail();
//         }

//         yield order.update({
//             status: Order.STATUS_PAID
//         });

//         payment = yield Payment.create({
//             payerId: user.id,
//             orderId: order.id,
//             object: msg
//         });
//         yield order.addPayment(payment);
        
//         var orderSigned = (yield Order.update({
//             status: Order.STATUS_SIGNED
//         }, {
//             where: {
//                 id: order.id,
//                 status: Order.STATUS_PAID,
//                 workId: {
//                     $ne: null
//                 }
//             }
//         }))[0];
        
//         yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_PAID, user.id);
        
//         if (orderSigned) {
//             yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_SIGNED);
//             scheduleTask.tempTask(order);
//         }
//         res.success();
//     }).catch(function (err) {
//         return next(err);
//     });
// }));

module.exports = router;