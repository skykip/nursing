"use strict";
const _ = require('lodash');
const Order = require('../../models').order;
const OrderWork = require('../../models').orderWork;
const OrderStatus = require('../../models').orderStatus;
const Work = require('../../models').work;
const co = require('co');
const errors = require('../../errors/index');
// const OrderManager = require('../../business/orderManager');
// const WorkSchedule = require('../../business/workerSchedule');
// const MessageSender = require('../../business/wxMessageSender');
// const scheduleTask = require('../../lib/scheduleTask');

const getOrderWorks = function (req, res, next) {
    co(function*() {
        let orderWorks = yield OrderWork.queryAll(req.work.id, OrderWork.STATUS_IDLE);
        return res.jsonp(orderWorks);
    }).catch(function (err) {
        return next(err);
    });
};

const findOrderWork = function (req, res, next) {
    let orderWorkId = req.params.orderWorkId;
    OrderWork.queryById(orderWorkId).then(function (orderWork) {
        if (orderWork) {
            req.orderWork = orderWork;
            return next();
        } else {
            return next(errors.newError(errors.types.TYPE_API_ORDER_WORK_NOT_FOUND));
        }
    }).catch(function (err) {
        return next(err);
    });
};

const getOrderWorksId = function (req, res, next) {
    co(function*() {
        let orderWork = req.orderWork;
        return res.jsonp(orderWork);
    }).catch(function (err) {
        return next(err);
    });
};

const acceptOrderWork = function (req, res, next) {
    co(function*() {
        let orderWork = req.orderWork;

        if (orderWork.status !== OrderWork.STATUS_IDLE) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_WORK_NOT_IDLE);
            return next(error);
        }

        let done = yield orderWork.acceptOrder();
        let order = yield Order.queryByOrderId(orderWork.orderId);

        if (done) {
            // yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_ACCEPT, req.user.id);
            yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_ACCEPT, orderWork.order.customerId);
            if (order.status === Order.STATUS_PAID) {
                order.status = Order.STATUS_SIGNED;
                order = yield order.save();
                yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_SIGNED);
                //scheduleTask.tempTask(order);
            }
        }
        yield orderWork.reload();
        return res.jsonp(orderWork);
    }).catch(function (err) {
        return next(err);
    });
};

const rejectOrderWork = function (req, res, next) {
    co(function*() {
        let orderWork = req.orderWork;

        if (orderWork.status !== OrderWork.STATUS_IDLE) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_WORK_NOT_IDLE);
            return next(error);
        }
        let done = yield orderWork.rejectOrder();
        if (done) {
            let order = yield Order.queryByOrderId(orderWork.orderId);
            //yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_REJECT, req.user.id);
            yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_REJECT, req.work.userId);
            //let work = yield OrderManager.takeAvailableWorkByOrder({orderId: order.id});
            // if (work) {
            //     let newOrderWork = yield OrderWork.invite(order.id, work.id);
            //     MessageSender.sendOrderWorkAssignMessage(order, newOrderWork);
            // }
            // 更新队列
            // WorkSchedule.recoverWorker({
            //     id: orderWork.workId,
            //     hospitalId: order.hospitalId
            // });
        };
        yield orderWork.reload();
        return res.jsonp(orderWork);
    }).catch(function (err) {
        return next(err);
    });
};

const findWork = function (req, res, next) {
    //let user = req.user;
    let workId;
    if(req.query.workId){
        workId = req.query.workId;
    }else{
        workId = req.body.workId;
    };
    co(function *(){
        let work = yield Work.queryById(workId);
        if (work) {
            req.work = work;
            next();
        } else {
            next(errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND));
            }
    }).catch(function (err) {
        return next(err);
    });
    // user.getWork().then(function (work) {
    //     if (work) {
    //         req.work = work;
    //         next();
    //     } else {
    //         next(errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND));
    //     }
    //     return null;
    // }).catch(function (err) {
    //     return next(err);
    // });
};

const checkOrderWorkOwner = function (req, res, next) {
    let work = req.work;
    let orderWork = req.orderWork;
    if (work.id === orderWork.workId) {
        return next();
    } else {
        return next(errors.newError(errors.types.TYPE_API_ORDER_WORK_NO_PERMISSION));
    }
};

const checkWorkApproved = function (req, res, next) {
    if (req.work.status === Work.STATUS_APPROVED) {
        return next();
    } else {
        return next(errors.newError(errors.types.TYPE_API_WORK_NOT_APPROVED));
    }
};

exports.getOrderWorks = [findWork, checkWorkApproved, getOrderWorks];
exports.getOrderWorksId = [findWork, checkWorkApproved, findOrderWork, checkOrderWorkOwner, getOrderWorksId];
exports.rejectOrderWork = [findWork, checkWorkApproved, findOrderWork, checkOrderWorkOwner, rejectOrderWork];
exports.acceptOrderWork = [findWork, checkWorkApproved, findOrderWork, checkOrderWorkOwner, acceptOrderWork];
