"use strict";

/**
 * orderManager.js
 * Created by
 * Copyright (c) 2016 kkpeihu Inc. All rights reserved.
 * Description:订单管理,新建，换人，续期等
 * Memo: 修改护工一对二
 */

const dateUtils = require('../utils/dateUtils');
const moment = require('moment');
const co = require('co');
const Observable = require('rx').Observable;
const Promise = require('bluebird');
const Settings = require('../utils/settings');
const Order = require('../models').order;
const Payment = require('../models').payment;//新增
const OrderPayment = require('../models').orderPayment;//新增

//const Finance = require('./financeAccounting');
//const serviceHelper = require('./serviceHelper');
const Model = require('../models');
const OrderWork = Model.orderWork;
const OrderStatus = Model.orderStatus;
const UserBlockedWork = Model.userBlockedWork;
const Worker = Model.work;
//const WorkerSchedule = require('../business/workerSchedule');
//const wxTemplateMsgSender = require('./wxMessageSender');
const errors = require('../errors');
const businessConfig = require('../config/config.js')['business'];


const cancelOrder = function (order, operatorId) {
    return co(function*() {

        let orderWork = yield OrderWork.findOne({
            where: {
                status: {
                    '$in': [OrderWork.STATUS_IDLE, OrderWork.STATUS_ACCEPT]
                },
                orderId: order.id
            }
        });

        order.amount = 0;
        order.actualEndDate = moment();
        yield order.save();
        yield order.markCancelPending();
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_CANCEL_PENDING, operatorId);
        yield order.markCancelling();
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_CANCELLING, operatorId);
        yield order.markCanceled();
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_CANCELLED);

        // if (orderWork) {
        //     WorkerSchedule.recoverWorker({id: orderWork.workId, hospitalId: order.hospitalId}, function () {

        //     });
        // }
    });
};
const startOrder = function (order, operatorId) {
    return co(function*() {

        // let orderWork = yield OrderWork.findOne({
        //     where: {
        //         status: {
        //             '$in': [OrderWork.STATUS_IDLE, OrderWork.STATUS_ACCEPT]
        //         },
        //         orderId: order.id
        //     }
        // });

        order.status = Order.STATUS_PROGRESSING;
        order.actualStartDate = moment();
        yield order.save();
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_PROGRESSING, operatorId);
        // if (orderWork) {
        //     WorkerSchedule.recoverWorker({id: orderWork.workId, hospitalId: order.hospitalId}, function () {

        //     });
        // }
    });
};
const endOrder = function (order, operatorId) {
    return co(function*() {

        // let orderWork = yield OrderWork.findOne({
        //     where: {
        //         status: {
        //             '$in': [OrderWork.STATUS_IDLE, OrderWork.STATUS_ACCEPT]
        //         },
        //         orderId: order.id
        //     }
        // });

        order.status = Order.STATUS_COMPLETED;
        order.actualEndDate = moment();
        yield order.save();
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_COMPLETED, operatorId);
        // if (orderWork) {
        //     WorkerSchedule.recoverWorker({id: orderWork.workId, hospitalId: order.hospitalId}, function () {

        //     });
        // }
    });
};
const refundOrder = function (order, operatorId) {
    return co(function*() {

        let orderStatus = yield OrderStatus.findOne({
            where: {
                status: Order.STATUS_PROGRESSING,
                orderId: order.id
            }
        });

        if (!orderStatus) {
            let orderWork = yield OrderWork.findOne({
                where: {
                    status: {
                        '$in': [OrderWork.STATUS_IDLE, OrderWork.STATUS_ACCEPT]
                    },
                    orderId: order.id
                }
            });
            if (orderWork) {
                WorkerSchedule.recoverWorker({id: orderWork.workId, hospitalId: order.hospitalId}, function () {
                });
            }
        }

        // 1. 找到申请退款的时间
        let refundDate = yield order.getStatusDate(Order.STATUS_REFUND_PENDING);

        if (!refundDate) {
            throw new Error("Order refund-pending date invalid");
        }
        let timezone = order.timezone();
        let endDate = moment.tz(refundDate, timezone);

        let balance = order.calcRefund(endDate);
        console.log("balance " + balance);

        // 2. 找到付款记录
        let payments = yield order.getPayments();
        let payment = payments && payments && payments[0];
        if (!payment) {
            throw new Error("Order payment not found");
        }

        // 3. 计算订单实际结束时间和结算金额
        order.actualEndDate = endDate;
        order.amount = order.price - balance;
        yield order.save();
        try {
            yield order.markRefunding();
        } catch (e) {
            yield order.reload();
            if (order.status !== Order.STATUS_REFUNDING) {
                throw new Error();
            }
        }
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_REFUNDING, operatorId);
        wxTemplateMsgSender.sendOrderRefundingMessage(order, balance);

        // 4. 确认支付方
        let payerIsCustomer = order.customerId === payment.payerId;
        let payHelper = require('../lib/payHelper');
        let pay = payerIsCustomer ? payHelper.customer : payHelper.worker;
        let tradeNum = order.tradeNum;
        let totalFee = (order.price * 100).toFixed();
        let refundFee = (balance * 100).toFixed();
        let refundNum = new Date().getTime();
        let params = {
            out_trade_no: tradeNum,
            out_refund_no: refundNum,
            total_fee: totalFee,
            refund_fee: refundFee
        };

        // 5. 查询退款记录
        let refundQuery = Promise.promisify(pay.refundQuery);
        let refund = Promise.promisify(pay.refund);
        let refundQueryResult = yield refundQuery({out_trade_no: tradeNum});
        console.log("refundQueryResult=", refundQueryResult);
        if (refundQueryResult.return_code !== 'SUCCESS') {
            throw new Error("RefundQuery return_code=" + refundQueryResult.return_code);
        }
        if (refundQueryResult.refund_count === '1'
            && refundQueryResult.refund_fee_0 === refundFee
            && refundQueryResult.refund_status_0 === 'SUCCESS') {
            // 6.1 已经发起过退款，并且已经成功
            yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_REFUNDED);
            yield order.markRefunded();
        } else if (refundQueryResult.err_code === 'REFUNDNOTEXIST') {
            // 6.2 发起退款
            let refundResult = yield refund(params);
            if (refundResult.return_code === 'SUCCESS' && refundResult.result_code === 'SUCCESS') {
                yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_REFUNDED);
                yield order.markRefunded();
            }

            console.log("refundResult=", refundResult);
        }
        yield order.reload();
        return order;
    });
};

//订单换人
const substituteOrder = function (order, workProvider, operatorId) {
    return co(function*() {
        let timezone = order.timezone();
        let now = moment.tz(timezone);
        let today = now.clone().startOf('day');
        let nextDay = today.clone().add(1, 'd').startOf('day');
        let endDate = moment.tz(order.endDate, timezone);
        let startDate = moment.tz(order.startDate, timezone);
        let price;

        // 1. 把当前护工加入客户的黑名单
        yield blockWorkForUser(order);

        // 2. 生成一张新订单
        if (yield order.isProgressedDurationLessThanOneHour()) {
            price = order.price;
        } else {
            let remainServiceDays;
            let remainServiceDaysExcludeToday = order.getRemainServiceDays(nextDay);
            let remainServiceDaysIncludeToday = order.getRemainServiceDays(now);

            if (remainServiceDaysIncludeToday !== remainServiceDaysExcludeToday) {
                remainServiceDays = remainServiceDaysIncludeToday;
                startDate = today;
            } else {
                remainServiceDays = remainServiceDaysExcludeToday;
                startDate = nextDay;
            }

            price = Math.min(order.price, remainServiceDays * order.dayPrice);
        }

        let options = {
            startDate: startDate,
            endDate: endDate,
            actualStartDate: startDate,
            actualEndDate: endDate,
            patientGender: order.patientGender,
            workerGender: order.workerGender,
            dependentLevel: order.dependentLevel,
            nursingTime: order.nursingTime,
            msg: order.msg,
            customerId: order.customerId,
            dayPrice: order.dayPrice,
            price: price,
            amount: price,
            hospitalId: order.hospitalId,
            status: Order.STATUS_PAID
        };

        let newOrder = yield Order.create(options);
        yield OrderStatus.logStatus(newOrder.id, OrderStatus.STATUS_PAID, operatorId);

        let payments = yield order.getPayments();
        yield newOrder.addPayments(payments);

        // 3. 修改旧订单结束时间以及价格
        order.amount = Math.max(0, order.price - newOrder.price);
        order.actualEndDate = today.endOf('day').toDate();
        yield order.save();

        // 4. 标记旧订单为已换人
        yield order.markSubstituting();
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_SUBSTITUTING, operatorId);
        yield order.markSubstituted();
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_SUBSTITUTED);

        // 改为成功
        order.status = Order.STATUS_COMPLETED;
        yield order.save();
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_COMPLETED);

        // 5. 指派护工给新订单
        let work = yield workProvider();
        if (work) {
            let orderWork = yield OrderWork.invite(newOrder.id, work.id);
            yield OrderStatus.logStatus(newOrder.id, OrderStatus.STATUS_ASSIGNED);
            wxTemplateMsgSender.sendOrderCreatedMessage(newOrder, orderWork, true, false);
        }
        newOrder = yield Order.query(newOrder.id);
        return newOrder;
    });
};

const blockWorkForUser = function (order) {
    return co(function *() {
        let customerId = order.customerId;
        let workId = order.workId;
        return yield UserBlockedWork.create({
            userId: customerId,
            workId: workId
        });
    });
};

const calcRenewStartDate = function (order) {
    let timezone = order.timezone();
    let endDate = order.endDate;
    let startDate = moment.tz(endDate, timezone).add(1, 'day').startOf('day');
    return startDate;
};

const calcRenewServiceDay = function (startDate, endDate) {
    startDate = moment(startDate);
    endDate = moment(endDate);

    let serviceDays = dateUtils.daysBetween(startDate, endDate) + 1;

    return co(function*() {

        let serviceConfig = yield Settings.getServiceConfig();

        if (serviceDays < serviceConfig.minServiceDays || serviceDays > serviceConfig.maxServiceDays) {
            return 0;
        }
        return serviceDays;
    });
};

const calcServiceDay = function (startDate, endDate, nursingTime) {
    startDate = moment(startDate);
    endDate = moment(endDate);
    let utcOffset = moment.parseZone(startDate).utcOffset();
    let today = moment().utc().utcOffset(utcOffset);

    let daysBeforeStart = dateUtils.daysBetween(today, startDate);
    let serviceDays = serviceHelper.calcServiceDays(nursingTime, startDate, endDate, today);

    return co(function*() {

        let serviceConfig = yield Settings.getServiceConfig();

        if (daysBeforeStart < serviceConfig.minDaysBeforeStart || daysBeforeStart > serviceConfig.maxDaysBeforeStart) {
            return 0;
        }

        if (serviceDays < serviceConfig.minServiceDays || serviceDays > serviceConfig.maxServiceDays) {
            return 0;
        }

        return serviceDays;
    });
};

const getAvailableWorks = function (options) {
    return co(function *() {
        let scheduleByOptions = Promise.promisify(WorkerSchedule.findAvailable);
        let availableWorks = yield scheduleByOptions(options);
        let workIds = [availableWorks[0].id];
        return Worker.queryByIds(workIds);
    }).catch(function (err) {
        return null;
    });
};

const takeAvailableWork = function (options) {
    return co(function *() {
        let scheduleByOptions = Promise.promisify(WorkerSchedule.newSchedule);
        let availableWorks = yield scheduleByOptions(options);
        let workIds = [availableWorks[0].id];
        let works = yield Worker.queryByIds(workIds);
        if (works && works.length) {
            return works[0];
        }
        return null;
    }).catch(function (err) {
        return null;
    })
};

const takeAvailableWorkByOrder = function (params) {
    return co(function *() {
        let scheduleByOrder = Promise.promisify(WorkerSchedule.newReschedule);
        let availableWorks = yield scheduleByOrder(params);
        let workIds = [availableWorks[0].id];
        let works = yield Worker.queryByIds(workIds);
        if (works && works.length) {
            return works[0];
        }
        return null;
    }).catch(function (err) {
        return null;
    });
};

const createOrder = function (options, workProvider) {
    return co(function *() {
        // step 1 : 检查服务时间段是否合法
        if (!serviceHelper.checkDate(options.startDate) || !serviceHelper.checkDate(options.endDate)) {
            throw errors.newError(errors.types.TYPE_API_ORDER_NO_AVAILABLE_WORKER);
        }
        // step 2 :  计算服务时间
        let serviceDay = yield calcServiceDay(options.startDate, options.endDate, options.nursingTime);
        if (serviceDay <= 0) {
            throw errors.newError(errors.types.TYPE_API_ORDER_NO_AVAILABLE_WORKER);
        }
        // step 3 : 找到合适的护工
        let work;
        try {
            work = yield workProvider();
        } catch (e) {
            console.log("workProvider e=", e);
        }
        if (!work) {
            throw errors.newError(errors.types.TYPE_API_ORDER_NO_AVAILABLE_WORKER);
        }
        // step 4 : 根据护工计算价格
        let priceOptions = {
            serviceDays: serviceDay,
            nursingTime: options.nursingTime,
            dependentLevel: options.dependentLevel
        };
        let dayPrice = work.price.calcDayPrice(priceOptions);
        let price = work.price.calcPrice(priceOptions);

        let timezone = "Asia/Shanghai";
        let startDate = moment.tz(options.startDate, timezone).startOf('day').toDate();
        let endDate = moment.tz(options.endDate, timezone).endOf('day').toDate();

        // step 5 : 创建订单
        let orderOptions = {
            startDate: startDate,
            endDate: endDate,
            actualStartDate: startDate,
            actualEndDate: endDate,
            patientGender: options.patientGender,
            workerGender: options.workerGender,
            dependentLevel: options.dependentLevel,
            nursingTime: options.nursingTime,
            msg: options.msg,
            customerId: options.customerId,
            dayPrice: dayPrice,
            price: price,
            amount: price,
            hospitalId: options.hospitalId
        };
        let order = yield Order.create(orderOptions);
        // step 6 : 将订单发送给护工
        let orderWork = yield OrderWork.invite(order.id, work.id);

        //Temporary
        function cancel() {
            co(function *() {
                let orderId = order.id;
                let this_order = yield Order.query(orderId);
                if (this_order.status === Order.STATUS_UNPAID) {
                    cancelOrder(this_order, 1);
                }
            }).catch(function(err) {
               console.log("timeout cancel err: ", err);
            });
        }

        let timeoutTime = businessConfig['orderWaitingTime'] + businessConfig['tolerateTime'];
        //多增加30秒来进行状态变换
        setTimeout(cancel, timeoutTime);

        return {
            order: order,
            orderWork: orderWork
        }
    });
};

//订单续期
const renewOrder = function (options) {
    let order = options.order;
    let endDate = options.endDate;

    return co(function *() {

        if (order.status !== Order.STATUS_PROGRESSING) {
            throw errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS);
        }

        endDate = moment(endDate);

        if (!serviceHelper.checkDate(endDate)) {
            throw errors.newError(errors.types.TYPE_API_BAD_REQUEST);
        }

        let startDate = calcRenewStartDate(order);
        endDate = endDate.endOf('day');

        let serviceDays = yield calcRenewServiceDay(startDate, endDate);

        if (serviceDays <= 0) {
            throw errors.newError(errors.types.TYPE_API_BAD_REQUEST);
        }

        let price = order.dayPrice * serviceDays;

        let options = {
            startDate: startDate,
            endDate: endDate,
            actualStartDate: startDate,
            actualEndDate: endDate,
            patientGender: order.patientGender,
            workerGender: order.workerGender,
            dependentLevel: order.dependentLevel,
            nursingTime: order.nursingTime,
            msg: order.msg,
            customerId: order.customerId,
            dayPrice: order.dayPrice,
            price: price,
            amount: price,
            hospitalId: order.hospitalId
        };

        let newOrder = yield Order.create(options);
        yield OrderWork.invite(newOrder.id, order.workId);
        return newOrder;
    })
};
const payOrder = function (order, operatorId) {
    return co(function*() {

        // let orderWork = yield OrderWork.findOne({
        //     where: {
        //         status: {
        //             '$in': [OrderWork.STATUS_IDLE, OrderWork.STATUS_ACCEPT]
        //         },
        //         orderId: order.id
        //     }
        // });

        order.status = Order.STATUS_PAID;
        yield order.save();
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_PAID, operatorId);
        let payment = yield Payment.create({
            payerId: operatorId,
            orderId: order.id,
            value: ""
        });
        yield order.addPayment(payment);
        // if (orderWork) {
        //     WorkerSchedule.recoverWorker({id: orderWork.workId, hospitalId: order.hospitalId}, function () {

        //     });
        // }
    });
};
module.exports = {
    calcServiceDay: calcServiceDay,
    calcRenewStartDate: calcRenewStartDate,
    calcRenewServiceDay: calcRenewServiceDay,
    getAvailableWorks: getAvailableWorks,
    takeAvailableWork: takeAvailableWork,
    takeAvailableWorkByOrder: takeAvailableWorkByOrder,
    createOrder: createOrder,
    renewOrder: renewOrder,
    substituteOrder: substituteOrder,
    refundOrder: refundOrder,
    cancelOrder: cancelOrder,
    startOrder:startOrder,//新加
    endOrder:endOrder,//新加
    payOrder:payOrder//新加
};
