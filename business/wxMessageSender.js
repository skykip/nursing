var co = require('co');
var _ = require('lodash');
var Order = require('../models').order;
var OrderWork = require('../models').orderWork;
var OrderRating = require('../models').orderRating;
var User = require('../models').user;
var Work = require('../models').work;
var Service = require('../models').service;
var Hospital = require('../models').hospital;
var Supervision = require('../models').supervision;
var Salary = require('../models').salary;

var WXAPI = require('../lib/wxapi');
var Templates = require('../data/wxTemplateMsg');
//var scheduleTask = require('../lib/scheduleTask');

function sendOrderCreatedMessage(order, orderWork, isReorder, isRenew) {
    co(function*() {
        if (!isRenew) {
            //发模版消息给护工
            sendOrderWorkAssignMessage(order, orderWork);
        }

        if(!isReorder) {
            //发模版消息给客户
            var customerTemplate = Templates.cUnpaidOrder(order);
            var customer = yield order.getCustomer();
            WXAPI.sendTemplateMsg2Customer(customer.openId, customerTemplate.templateId, customerTemplate.url, customerTemplate.data);

            //发消息给督工
            //var supervisions = yield Supervision.queryByHospitalId(order.hospitalId ? order.hospitalId : order.hospital.id);
            var supervisions = yield Supervision.queryAll();
            if (supervisions && supervisions.length > 0) {
                //var supervisorIds = [].concat(_.map(supervisions, function(supervision) { return supervision.user.openId; }));
                var supervisorIds = [];
                for (var index = 0; index < supervisions.length; ++index) {
                    if (supervisions[index].user) {
                        supervisorIds.push(supervisions[index].user.openId);
                    }
                }
                var supervisorTemplate = Templates.sOrderReminder(order);
                console.log("new orders supervisorIds:", supervisorIds);
                WXAPI.sendTemplateMsg2Supervisor(supervisorIds, supervisorTemplate.templateId, supervisorTemplate.url, supervisorTemplate.data);
            }
            //WXAPI.sendTemplateMsg2Worker(supervisor.openId, supervisorTemplate.templateId, supervisorTemplate.url, supervisorTemplate.data);
        }
    }).catch(function (err) {
        console.error("sendOrderCreatedMessage err=", err);
    });
}

function sendOrderWorkAssignMessage(order, orderWork) {
    co(function*() {
        //发模版消息给护工
        var work = yield Work.queryById(orderWork.workId);
        var worker = work.user;
        var workerTemplate = Templates.wConfirmOrder(order, orderWork);
        WXAPI.sendTemplateMsg2Worker(worker.openId, workerTemplate.templateId, workerTemplate.url, workerTemplate.data);
    }).catch(function (err) {
        console.error("sendOrderWorkAssignMessage err=", err);
    });
}

function sendOrderRefundingMessage(order, balance) {
    co(function*() {
        var customerTemplate = Templates.cRefundingReminder(order, balance);
        var customer = yield order.getCustomer();
        WXAPI.sendTemplateMsg2Customer(customer.openId, customerTemplate.templateId, customerTemplate.url, customerTemplate.data);
    }).catch(function (err) {
        console.error("sendOrderWorkAssignMessage err=", err);
    });
}

function sendOrderRefundedMessage(order, balance) {
    co(function*() {
        var customerTemplate = Templates.cRefundedReminder(order, balance);
        var customer = yield order.getCustomer();
        WXAPI.sendTemplateMsg2Customer(customer.openId, customerTemplate.templateId, customerTemplate.url, customerTemplate.data);
    }).catch(function (err) {
        console.error("sendOrderWorkAssignMessage err=", err);
    });
}

function sendWorkerReviewResultMessage(worker) {
    co(function*() {
        var isPass = (worker.status === Work.STATUS_APPROVED);
        var user_worker = yield User.queryById(worker.userId);
        var workerTemplate = Templates.wReviewResultReminder(isPass, worker);
        WXAPI.sendTemplateMsg2Worker(user_worker.openId, workerTemplate.templateId, workerTemplate.url, workerTemplate.data);
    }).catch(function (err) {
        console.error("sendOrderWorkAssignMessage err=", err);
    });
}

function sendSalaryMessage(salary) {
    co(function*() {
        var worker = yield Work.queryById(salary.workId);
        var user_worker = yield User.queryById(worker.userId);
        var workerTemplate = Templates.wSalaryReminder(salary);
        WXAPI.sendTemplateMsg2Worker(user_worker.openId, workerTemplate.templateId, workerTemplate.url, workerTemplate.data);
    }).catch(function (err) {
        console.error("sendOrderWorkAssignMessage err=", err);
    });
}

function sendHandleMessage(order) {
    co(function*() {
        var content = "";
        if (order.status === Order.STATUS_REFUND_PENDING) {
            content = "中止订单并退款";
        } else if (order.status === Order.STATUS_SUBSTITUTE_PENDING) {
            content = "更换护工";
        } else {

        }
        var customerTemplate = Templates.cHandleRemider(order, content);
        var customer = yield order.getCustomer();
        WXAPI.sendTemplateMsg2Customer(customer.openId, customerTemplate.templateId, customerTemplate.url, customerTemplate.data);
    }).catch(function (err) {
        console.error("sendOrderWorkAssignMessage err=", err);
    });
}

function sendSupervisorSuccessMessage(openId) {
    var supervisorTemplate = Templates.sSuccessReminder();
    //WXAPI.sendTemplateMsg2Worker(openId, supervisorTemplate.templateId, supervisorTemplate.url, supervisorTemplate.data);
    // Harold: 3月30日修改
    WXAPI.sendTemplateMsg2Supervisor([openId], supervisorTemplate.templateId, supervisorTemplate.url, supervisorTemplate.data);
}

exports.sendOrderCreatedMessage = sendOrderCreatedMessage;
exports.sendOrderWorkAssignMessage = sendOrderWorkAssignMessage;
exports.sendOrderRefundingMessage = sendOrderRefundingMessage;
exports.sendOrderRefundedMessage = sendOrderRefundedMessage;
exports.sendWorkerReviewResultMessage = sendWorkerReviewResultMessage;
exports.sendSalaryMessage = sendSalaryMessage;
exports.sendHandleMessage = sendHandleMessage;
exports.sendSuccessMessage = sendSupervisorSuccessMessage;