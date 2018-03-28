

"use strict";
const co = require('co');
const _ = require('lodash');
const errors = require('../../errors');
const Order = require('../../models').order;
const Work = require('../../models').work;
const OrderRating = require('../../models').orderRating;
const OrderManager = require('../../business/orderManager');
const moment = require('moment');

const orderInfo = function(req, res, next) {
    let orderId = req.query.orderId;
    //res.send('respond:'+userId);
    Order.OrderInfo(orderId).then(function (order) {
        if (!order) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
            return next(error);
        }
        req.targetTest = order;
        next();
    }).catch(function(e){
        let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
        return next(error);
    }); 
};
const getOrderById = function(req, res, next) {
      return res.jsonp(req.targetTest);
  };
//用户所有未开始订单
 const userAllNotStartOrderList = function(req, res, next) {
    let userId = req.query.userId;
    Order.GetUserAllNotStartOrder(userId).then(function (o) {
        o.forEach(function(item,index){  
            let status = item.status;
            if(status===Order.STATUS_UNPAID){
                item.canCancel=true;
                item.canPaid = true;
            }else{
                item.canCancel=false;
                item.canPaid = false;
            };
        });
        return res.jsonp(o);
    }).catch(function(e){
        let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
        return next(error);
    }); 
} 
//用户所有进行中的订单
const userAllProcessingOrderList = function(req, res, next) {
    let userId = req.query.userId;
    Order.GetUserAllProcessingOrder(userId).then(function (o) {
        return res.jsonp(o);
    }).catch(function(e){
        let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
        return next(error);
    }); 
} 
//用户所有完结的订单
const userAllCompletedOrderList = function(req, res, next) {
        let userId = req.query.userId;
        Order.GetUserAllCompletedOrder(userId).then(function (o) {
        return res.jsonp(o);
    }).catch(function(e){
        let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
        return next(error);
    }); 
} 

//护工所有未开始订单
const workAllNotStartOrderList = function(req, res, next) {
    let workId = req.query.workId;
    Order.GetWorkAllNotStartOrder(workId).then(function (o) {
        o.forEach(function(item,index){  
            let startDate = moment(item.startDate);
            let status = item.status;
            if(Order.STATUSES_STARTABLE.indexOf(status) >= 0&&moment()>=startDate){
                item.canStart=true;
            }else{
                item.canStart=false;
            };
        });
        // if (!order.canStart()) {
        //     return res.jsonp({order_Id:order.id,customer_Id:order.customerId,work_Id:order.workId,canStart:false});
        // };
        // if(moment()>=order.startDate){
        //     return res.jsonp({order_Id:order.id,customer_Id:order.customerId,work_Id:order.workId,canStart:true});
        // }else{
        //     return res.jsonp({order_Id:order.id,customer_Id:order.customerId,work_Id:order.workId,canStart:false});
        // };
        return res.jsonp(o);
    }).catch(function(e){
        let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
        return next(error);
    }); 
} 
//护工所有进行中的订单
const workAllProcessingOrderList = function(req, res, next) {
    let workId = req.query.workId;
    Order.GetWorkAllProcessingOrder(workId).then(function (o) {
        o.forEach(function(item,index){  
            let endDate = moment(item.endDate);
            let status = item.status;
            //计算实时价格            
            var actualStartDate = moment(item.actualStartDate);
            var timeOut = moment().unix() - actualStartDate.unix();
            let dayPrice = item.dayPrice;
            let duration = Order.TimeFormatHour(timeOut);
            let dayNum = Math.ceil( +duration/24);
            item.charging = +dayPrice*+dayNum;
            if(Order.STATUSES_SUBSTITUTABLE.indexOf(status) >= 0&&moment()>=endDate){
                item.canEnd=true;
            }else{
                item.canEnd=false;
            };
        });
        return res.jsonp(o);
    }).catch(function(e){
        let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
        return next(error);
    }); 
} 
//护工所有完结的订单
const workAllCompletedOrderList = function(req, res, next) {
        let workId = req.query.workId;
        Order.GetWorkAllCompletedOrder(workId).then(function (o) {
        return res.jsonp(o);
    }).catch(function(e){
        let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
        return next(error);
    }); 
} 

//创建订单
const createOrder=function(req, res, next){
    let userId = req.body.userId;               //用户ID
    let hospitalId=req.body.hospitalId;         //医院ID
    let workId=req.body.workId;  　　　　　　　　//护工ID

    let patientGender=req.body.patientGender;   //病人性别
    let workerGender=req.body.workerGender;     //护工性别
    let dependentLevel=req.body.dependentLevel; //护理等级
    let nursingTime=req.body.nursingTime; //护理时间
    let startDate=req.body.startDate;     //开始时间
    let endDate=req.body.endDate;         //结束时间
     
    let orderParm={
        customerId:userId,
        hospitalId:hospitalId,
        workId:workId,
        patientGender:patientGender,
        workerGender:workerGender,
        dependentLevel:dependentLevel,
        nursingTime:nursingTime,
        startDate:startDate,
        endDate:endDate
    };
    Order.CreateOrder(orderParm).then(function (o) {
        //return res.jsonp(o);
        if (!o) {
            // todo 增加错误类型：创建订单失败tod
            let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
            return next(error);  
        }
        else{
            res.jsonp({status:0, message:'订单创建成功', data:o});     
        }
    }).catch(function(e){
        // todo 增加错误类型：创建订单失败
        let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
        return next(error);
    });
}
//结束订单
const endOrder=function(req, res, next){
    let orderId=req.body.orderId;  　 //订单ID
    let userId=req.body.userId;  　 //用户ID
    Order.OrderStatus(orderId).then(function (data){
        if (!data) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
            return next(error);  
        }else{
            Order.EndOrder(userId,orderId,data.dataValues.status).then(function (data) { 
                if(!data){
                    // todo 增加错误类型： 更新失败
                    let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
                    return next(error);   
                }
                else{
                    res.jsonp({status:0, message:'更新成功', data:null});       
                }
            });
        }
    }).catch(function(e){
        let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
        return next(error);
    });;
};

//查找护工当前待接单订单yzl########
const getWorkAvailableOrdersList = function (req, res, next) {
    // let options = {
    //     pagination: req.pagination
    // };
    let workId = req.query.workId;
    let status = 'idle';
        co(function *() {
            let OrderWork = require('../../models').orderWork;
            let order = yield OrderWork.queryAll(workId,status);
            
    
            //获取总页数相关操作
            // let totalPages;
            // let page = {
            //     pagination:{page:1,limit:10000}
            // };
            // let pages = yield Work.queryWorksBasicInfo(page);
            //     totalPages = pages.length / +options.pagination.limit;
            //     totalPages = (totalPages > 1)
            //         ? Math.ceil(+totalPages)//向上取整，有小数则+1
            //         : 1;
            
            // let retunrnWorks={
            //         totalPages:totalPages,
            //         data:works
            // };
            return res.jsonp(order);
        }).catch(function (err) {
            return next(err);
        });
};
const findOrder = function (req, res, next) {
    let orderId = req.params.orderId;
    if (!orderId) {
        throw new Error("This should apply on router which have 'orderId' params");
    }
    Order.queryByOrderId(orderId).then(function (order) {
        if (order === null) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
            next(error);
        } else {
            req.order = order;
            next();
        };
        return null;
    }).catch(function (err) {
        return next(err);
    });
};
const checkOrderOwner = function (req, res, next) {
    let userId;
    if(req.query.userId){
        userId = req.query.userId;//req.user.id
    }else{
        userId = req.body.userId;//req.user.id
    }
    if (req.order.customerId === +userId) {
        return next();
    } else {
        let error = errors.newError(errors.types.TYPE_API_ORDER_NO_PERMISSION);
        return next(error);
    }
};
const checkOrderOwnerWork = function (req, res, next) {
    let userId = req.query.userId;//req.user.id
    co(function*() {
        let work = yield Work.queryWorkByUserId(userId);
        if (req.order.workId === work.id) {
            req.work = work;//把护工信息往下传递
            return next();
        } else {
            let error = errors.newError(errors.types.TYPE_API_ORDER_NO_PERMISSION);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
   
};
const putOrdersIdCancel = function (req, res, next) {
    let order = req.order;
    let userId = req.query.userId;
    //let user = req.user;
    co(function *() {
        if (!order.canCancel()) {
            return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        };
        yield OrderManager.cancelOrder(order, userId);//user.id
        yield order.reload();
        return res.jsonp(order);
    }).catch(function (err) {
        return next(err);
    });
};

const putOrdersIdStart = function (req, res, next) {
    let order = req.order;
    let userId = req.query.userId;
    //let user = req.user;
    co(function *() {
        // if (!order.canCancel()) {
        //     return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        // };
        if (!order.canStart()) {
            return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        };
        yield OrderManager.startOrder(order, userId);//user.id
        yield order.reload();
        return res.jsonp(order);
    }).catch(function (err) {
        return next(err);
    });
};
const putOrdersIdEnd = function (req, res, next) {
    let order = req.order;
    let userId = req.query.userId;
    let work = req.work;
    //let user = req.user;
    co(function *() {
        // if (!order.canCancel()) {
        //     return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        // };
        if (!order.canCompleted()) {
            return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        };
        yield OrderManager.endOrder(order, userId);//user.id
        yield order.reload();
        
        //计算护工星级
        let workOrders = yield Order.GetWorkAllCompletedOrder(work.id);
        let ratingSkills=0;
        let ratingAttitudes=0;
        workOrders.forEach(function(value,index){
            if(value.orderRating){
                ratingAttitudes+=value.orderRating.dataValues.ratingAttitude;
                ratingSkills+=value.orderRating.dataValues.ratingSkill;
            }
        });
        let aveRating =(ratingSkills+ratingAttitudes)/(2*workOrders.length);
        aveRating = +aveRating.toFixed(2);
        let star1;
        let star2;
        if(workOrders.length>=0&&workOrders.length<20){
            star1=1;
        }else if(workOrders.length>=20&&workOrders.length<40){
            star1=2;
        }else if(workOrders.length>=40&&workOrders.length<150){
            star1=3;
        }else if(workOrders.length>=150&&workOrders.length<300){
            star1=4;
        }else if(workOrders.length>=300){
            star1=5;
        };
        if(aveRating>=0&&aveRating<3){
            star2=1;
        }else if(aveRating>=3&&aveRating<3.5){
            star2=2;
        }else if(aveRating>=3.5&&aveRating<4){
            star2=3;
        }else if(aveRating>=4&&aveRating<4.5){
            star2=4;
        }else if(aveRating>=4.5){
            star2=5;
        };
       work.star=Math.min(star1,star2);
        yield work.reload();
        return res.jsonp(order);
    }).catch(function (err) {
        return next(err);
    });
};
const getCanStartOrder = function (req, res, next) {
    let order = req.order;
    let userId = req.query.userId;
    //let user = req.user;
    co(function *() {
        // if (!order.canCancel()) {
        //     return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        // };
        // if (!order.canCompleted()) {
        //     return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        // };
        if (!order.canStart()) {
            return res.jsonp({order_Id:order.id,customer_Id:order.customerId,work_Id:order.workId,canStart:false});
        };
        if(moment()>=order.startDate){
            return res.jsonp({order_Id:order.id,customer_Id:order.customerId,work_Id:order.workId,canStart:true});
        }else{
            return res.jsonp({order_Id:order.id,customer_Id:order.customerId,work_Id:order.workId,canStart:false});
        };
        
        // yield OrderManager.endOrder(order, userId);//user.id
        // yield order.reload();
        
    }).catch(function (err) {
        return next(err);
    });
};
const getOrdersIdPay = function (req, res, next) {
    let order = req.order;
    let userId = req.query.userId;
    //let user = req.user;
    co(function *() {
        // if (!order.canCancel()) {
        //     return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        // };
        yield OrderManager.payOrder(order, userId);//user.id
        yield order.reload();
        return res.jsonp(order);
    }).catch(function (err) {
        return next(err);
    });
};
//用户添加评论
const putOrdersIdRating = function (req, res, next) {
    let comment = req.body.comment;
    let ratingSkill = req.body.ratingSkill;
    let ratingAttitude = req.body.ratingAttitude;
    // var tc = require('text-censor')
    // tc.filter('Ur so sexy babe!',function(err, censored){
    //     console.log(censored) // 'Ur so ***y babe!'
    // })
    // let a = tc.filter('Ur so sexy babe!');

    let order = req.order;
    // let user = req.user;

    // if (order.customerId !== user.id) {
    //     let error = errors.newError(errors.types.TYPE_API_ORDER_NO_PERMISSION);
    //     return next(error);
    // }

    if (order.status !== Order.STATUS_COMPLETED) {
        let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_COMPLETE);
        return next(error);
    }
    let value = {
        orderId: order.id,
        comment: comment,
        ratingSkill: ratingSkill,
        ratingAttitude:ratingAttitude
    };
    co(function*() {
        let orderRating = yield order.getOrderRating();
        if (orderRating) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_RATING_CONFLICT);
            return next(error);
        } else {
            orderRating = yield OrderRating.create(value);

            //计算护工星级
        let workId = order.workId;  
        let work = yield Work.queryById(workId);            
        let workOrders = yield Order.GetWorkAllCompletedOrder(work.id);
        let ratingSkills=0;
        let ratingAttitudes=0;
        workOrders.forEach(function(value,index){
            if(value.orderRating){
                ratingAttitudes+=value.orderRating.dataValues.ratingAttitude;
                ratingSkills+=value.orderRating.dataValues.ratingSkill;
            }
        });
        let aveRating =(ratingSkills+ratingAttitudes)/(2*workOrders.length);
        aveRating = +aveRating.toFixed(2);
        let star1;
        let star2;
        if(workOrders.length>=0&&workOrders.length<20){
            star1=1;
        }else if(workOrders.length>=20&&workOrders.length<40){
            star1=2;
        }else if(workOrders.length>=40&&workOrders.length<150){
            star1=3;
        }else if(workOrders.length>=150&&workOrders.length<300){
            star1=4;
        }else if(workOrders.length>=300){
            star1=5;
        };
        if(aveRating>=0&&aveRating<3){
            star2=1;
        }else if(aveRating>=3&&aveRating<3.5){
            star2=2;
        }else if(aveRating>=3.5&&aveRating<4){
            star2=3;
        }else if(aveRating>=4&&aveRating<4.5){
            star2=4;
        }else if(aveRating>=4.5){
            star2=5;
        };
        work.star=Math.min(star1,star2);
        yield work.reload();
        };
        return res.jsonp(orderRating);
    }).catch(function (err) {
        return next(err);
    });
};
//用户查看评论
const getOrdersIdRating = function (req, res, next) {
    co(function*() {
        let order = req.order;
        //let user = req.user;
        let error;
        // if (order.customerId !== user.id) {
        //     error = errors.newError(errors.types.TYPE_API_ORDER_NO_PERMISSION);
        //     return next(error);
        // }

        let orderRating = yield order.getOrderRating();
        if (!orderRating) {
            error = errors.newError(errors.types.TYPE_API_ORDER_RATING_NOT_FOUND);
            return next(error);
        }
        return res.jsonp(orderRating);
    }).catch(function (err) {
        return next(err);
    });
};
//用户订单列表
exports.getUserAllNotStartOrderList=[userAllNotStartOrderList];
exports.getuserAllProcessingOrderList=[userAllProcessingOrderList];
exports.getUserAllCompletedOrderList=[userAllCompletedOrderList];
//护工订单列表
//新加判定订单是否可以开始
exports.getWorkAllNotStartOrderList=[workAllNotStartOrderList];
exports.getWorkAllProcessingOrderList=[workAllProcessingOrderList];
exports.getWorkAllCompletedOrderList=[workAllCompletedOrderList];

//护工待接单列表
//exports.getWorkAvailableOrdersList=[getWorkAvailableOrdersList];

exports.getOrderById = [orderInfo,getOrderById];
exports.createOrder=[createOrder];
exports.endOrder=[endOrder];

//用户取消订单
exports.putOrdersIdCancel = [findOrder, checkOrderOwner, putOrdersIdCancel];
//判定是否到了订单开始那天
exports.getCanStartOrder = [findOrder, checkOrderOwnerWork, getCanStartOrder];
//护工操作订单开始
exports.putOrdersIdStart = [findOrder, checkOrderOwnerWork, putOrdersIdStart];
//护工操作订单完结
exports.putOrdersIdEnd = [findOrder, checkOrderOwnerWork, putOrdersIdEnd];
//用户支付订单
exports.getOrdersIdPay = [findOrder, checkOrderOwner, getOrdersIdPay];
//用户评价订单
exports.putOrdersIdRating = [findOrder, checkOrderOwner, putOrdersIdRating];
//用户查看订单评价
exports.getOrdersIdRating = [findOrder, checkOrderOwner, getOrdersIdRating];








