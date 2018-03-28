/**
 * wxTemplateMsg.js
 * Created by haroldsong on 16/4/12.
 * Copyright (c) 2016 Tencent Inc. All rights reserved.
 * Description:微信各种消息推送模版
 */

var moment = require('moment');
var config = require('../config/config');

var dateFormat = function(date) {
    return moment(date).format("YYYY年MM月DD日");
};

var timeFormat = function(date) {
    //return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    var time = moment(date);
    return time.format('HH:mm:ss');
};

var templateIdMap = {
    //护工订单推送
    "w_comfirmedOrderReminder": "9-OI9om1ivUFaP2-zn1WG0EOgcn8fKaUjTl80_pO9Dg",
    //护工工作提醒----提前一天
    "w_orderReminder": "ooI9YK780II4f2Kj2XgI_-X24jHHqCIhhH4Em35VeIA",
    //护工签到提醒----签到提醒
    "w_checkinReminder": "B4aGmOg1H_zSRI5G-CRPaocnVTekrddKX3SQ7nKjn8U",
    //护工订单进行中
    "w_processingOrder": "ig25xGbUCzMgH6FgK8DLbxS1yGTdt_lu2CzLWxPR9iU",
    //护工工资发放通知
    "w_salaryReminder": "ooI9YK780II4f2Kj2XgI_-X24jHHqCIhhH4Em35VeIA",
    //护工审核结果通知
    "w_reviewResultReminder": "LHU3C50HFChBPflte066W1hn5F8UFc8ohaSvU9HN2jk",
    //客户订单未支付推送
    "c_unpaidOrder": "SciDcx_hRH5cSizhCJELeRpDVGIdU_6jANW1PACr77M",
    //客户已经确定的订单:即已经付款, 且安排了护工
    "c_confirmedOrder": "bgF4UnZw_K61Dtbo6u1RXvoS9xFWrBshv86BORj1KlE",
    //客户订单已经完成
    "c_finishedOrder": "cJ6F0-A4I_0r-Mp61cEkT1j5HPoYPwsa76ExeYzbH1Q",
    //客户订单进行中
    "c_processingOrder": "hAgRXqB74n3gtywGgxJgjhfzqNhalk941vUVNzvQzUs",
    //护工签到对客户的提醒
    "c_checkinReminder": "hAgRXqB74n3gtywGgxJgjhfzqNhalk941vUVNzvQzUs",
    //订单退款中对客户的提醒
    "c_refundingReminder": "uyQktHHpiXpkWDhNSjRFeez68ajWHqtIkiX5B3xa2cw",
    //提前一天提醒用户续单
    "c_renewOrderReminder": "ciEM8sMVP32P2FjSj-m-xLHDB5RThB4rB38vGgE5kmY",
    //订单处理提醒
    "c_handleReminder": "_qR2t3ZYAbHjosjvmJlJQPdpz3rtW43OLaHqc4BXR7w",
    //监督订单推送
    "s_orderReminder": "HI8orZ4yZNLmNTcUw6C85VzUHSa91CDSO_cGinuTg-I",
    //督工消息推送
    "s_successReminder": "xLNetPECXGZMpAY0PIAgJp60hWvFLb2AwShocH-UW3o"
};

var customerCheckinReminder = function (checkinResult) {
    var url = '';
    var data = {
        "first": {
            "value": "护工今日已签到",
            "color": "#173177"
        },
        "keyword1": {
            "value": "护工服务",
            "color": "#173177"
        },
        "keyword2": {
            "value": dateFormat(checkinResult.date),
            "color": "#173177"
        },
        "remark": {
            "value": /*"回复 1 就可以在今天收到定时的护理信息"*/"",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["c_checkinReminder"],
        url: url,
        data: data
    };
};

var customerUnpaidOrder = function (order) {
    var url = config.url + '/customer.html#!/order/' + order.id;
    var data = {
        "first": {
            "value": "您的订单已生成，请按以下金额付款",
            "color": "#173177"
        },
        "keyword1": {
            "value": order.tradeNum,
            "color": "#173177"
        },
        "keyword2": {
            "value": order.price + "元",
            "color": "#173177"
        },
        "keyword3": {
            "value": timeFormat(order.createdAt),
            "color": "#173177"
        },
        "remark": {
            "value": "我们会尽快为您安排护工",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["c_unpaidOrder"],
        url: url,
        data: data
    };
};

var customerProcessingOrder = function (order) {
    var url = config.url + '/customer.html#!/order/' + order.id;
    var data = {
        "first": {
            "value": "正在进行中的订单",
            "color": "#173177"
        },
        "keyword1": {
            "value": "护工服务",
            "color": "#173177"
        },
        "keyword2": {
            "value": dateFormat(order.startDate) + " 至 " + dateFormat(order.endDate),
            "color": "#173177"
        },
        "remark": {
            "value": "点击查看详情",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["c_processingOrder"],
        url: url,
        data: data
    };
};

var customerConfirmedOrder = function (order) {
    var url = config.url + '/customer.html#!/order/' + order.id;
    var data = {
        "first": {
            "value": "您的订单 " + order.tradeNum + " 经安排完毕",
            "color": "#173177"
        },
        "keyword1": {
            "value": "护工服务",
            "color": "#173177"
        },
        "keyword2": {
            "value": order.price + "元",
            "color": "#173177"
        },
        "keyword3": {
            "value": dateFormat(order.startDate) + " 至 " + dateFormat(order.endDate),
            "color": "#173177"
        },
        "keyword4": {
            "value": order.hospital.name,
            "color": "#173177"
        },
        "keyword5": {
            "value": "已支付, 护工已确认",
            "color": "#173177"
        },
        "remark": {
            "value": "护工会按时开始工作",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["c_confirmedOrder"],
        url: url,
        data: data
    };
};

var customerFinishedOrder = function (order) {
    var url = config.url + '/customer.html#!/order/' + order.id;
    var data = {
        "first": {
            "value": "订单已完成",
            "color": "#173177"
        },
        "keyword1": {
            "value": dateFormat(order.startDate) + " 至 " + dateFormat(order.endDate) + "的护工服务",
            "color": "#173177"
        },
        "keyword2": {
            "value": dateFormat(order.endDate),
            "color": "#173177"
        },
        "remark": {
            "value": "希望您能评价我们的服务",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["c_finishedOrder"],
        url: url,
        data: data
    };
};

var customerRefundingOrderReminder = function (order, balance) {
    var url = config.url + '/customer.html#!/order/' + order.id;
    var data = {
        "first": {
            "value": "对于我们的服务没能让您满意深表抱歉",
            "color": "#173177"
        },
        "keyword1": {
            "value": balance + " 元",
            "color": "#173177"
        },
        "keyword2": {
            "value": timeFormat(new Date()),
            "color": "#173177"
        },
        "remark": {
            "value": "退款完成后我们会通知您, 如有疑问请拨打我们的客服专线",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["c_refundingReminder"],
        url: url,
        data: data
    };
};

var customerRefundedOrderReminder = function (order, balance) {
    var url = config.url + '/customer.html#!/order/' + order.id;
    var data = {
        "first": {
            "value": "退款成功",
            "color": "#173177"
        },
        "keyword1": {
            "value": balance + " 元",
            "color": "#173177"
        },
        "keyword2": {
            "value": timeFormat(new Date()),
            "color": "#173177"
        },
        "remark": {
            "value": "再次对于我们的服务没能让您满意深表抱歉, 如有疑问请拨打我们的客服专线",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["c_refundingReminder"],
        url: url,
        data: data
    };
};

var customerRenewOrderReminder = function (order) {
    var url = config.url + '/customer.html#!/order/' + order.id;
    var data = {
        "first": {
            "value": "您好, 您的护工服务即将到期",
            "color": "#173177"
        },
        "keyword1": {
            "value": dateFormat(order.startDate) + " 至 " + dateFormat(order.endDate) + "的护工服务",
            "color": "#173177"
        },
        "keyword2": {
            "value": dateFormat(order.endDate),
            "color": "#173177"
        },
        "remark": {
            "value": "点击详情可以进行续期操作, 如无需续期请忽略本条消息, 打扰见谅",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["c_renewOrderReminder"],
        url: url,
        data: data
    };
};

var customerHandleOrderReminder = function (order, handleContent) {
    var url = config.url + '/customer.html#!/order/' + order.id;
    var data = {
        "first": {
            "value": "您的请求已被受理",
            "color": "#173177"
        },
        "keyword1": {
            "value": handleContent,
            "color": "#173177"
        },
        "keyword2": {
            "value": moment().format("YYYY年MM月DD日 hh:mm:ss"),
            "color": "#173177"
        },
        "remark": {
            "value": "我们会尽快安排客服与您联系, 如有问题请拨打客服电话",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["c_handleReminder"],
        url: url,
        data: data
    };
};

var workerComfirmedOrderReminder = function (order, orderWork) {
    //console.log("----Hospital Name----", order.hospital.name);
    var url = config.url + '/worker.html#!/order/idle/' + orderWork.id;
    var data = {
        "first": {
            "value": "您有新的订单等待确认",
            "color": "#173177"
        },
        //护理项目
        "keyword1": {
            "value": dateFormat(order.startDate) + " 至 " + dateFormat(order.endDate) + " 服务",
            "color": "#173177"
        },
        //消费金额
        "keyword2": {
            "value": order.price + " 元",
            "color": "#173177"
        },
        //预约时间
        "keyword3": {
            "value": timeFormat(order.createdAt),
            "color": "#173177"
        },
        //预约地址(服务医院)
        "keyword4": {
            "value": ""/*order.hospital.name*/,
            "color": "#173177"
        },
        //订单状态
        "keyword5": {
            "value": "待护工确认",
            "color": "#173177"
        },
        "remark": {
            "value": "点击查看订单详情并尽快确认接受订单",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["w_comfirmedOrderReminder"],
        url: url,
        data: data
    };
};

var workerProcessingOrder = function (order) {
    var url = config.url + '/worker.html#!/order/' + order.id;
    var data = {
        "first": {
            "value": "正在进行中的订单",
            "color": "#173177"
        },
        "keyword1": {
            "value": "护工服务",
            "color": "#173177"
        },
        "keyword2": {
            "value": dateFormat(order.startDate) + " 至 " + dateFormat(order.endDate),
            "color": "#173177"
        },
        "remark": {
            "value": "点击查看详情",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["w_processingOrder"],
        url: url,
        data: data
    };
};

var workerOrderReminder = function (order) {
    var url = config.url + '/worker.html#!/order/' + order.id;
    var data = {
        "first": {
            "value": "明天有新的工作开始",
            "color": "#173177"
        },
        "keyword1": {
            "value": dateFormat(order.startDate) + " 至 " + dateFormat(order.endDate) + " 服务",
            "color": "#173177"
        },
        "keyword2": {
            "value": moment().format('HH:mm:ss'),
            "color": "#173177"
        },
        "remark": {
            "value": "不要忘了明天按时护理签到",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["w_orderReminder"],
        url: url,
        data: data
    };
};

var workerCheckinReminder = function (order) {
    var url = '';
    var data = {
        "first": {
            "value": /*"签到提醒"*/"工作提醒",
            "color": "#173177"
        },
        "keyword1": {
            "value": /*"到达医院后不要忘了今天的工作签到"*/"请准时到岗工作",
            "color": "#173177"
        },
        "keyword2": {
            "value": dateFormat(new Date()),
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["w_checkinReminder"],
        url: url,
        data: data
    };
};

var workerSalaryReminder = function (salaryResult) {
    var url = config.url + '/worker.html#!/money';
    var data = {
        "first": {
            "value": "你上月的薪水已经发放",
            "color": "#173177"
        },
        "keyword1": {
            "value": "上月工资总计 " + salaryResult.realWage + " 元, 实际发放 " + salaryResult.realWage + " 元",
            "color": "#173177"
        },
        "keyword2": {
            "value": timeFormat(new Date()),
            "color": "#173177"
        },
        "remark": {
            "value": "如有疑问请联系公司财务",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["w_salaryReminder"],
        url: url,
        data: data
    };
};

var workerReviewResultReminder = function (isPass, worker) {
    var url = '';
    var first = '';
    var remark = '';
    var status = '';
    if(isPass) {
        url = config.url + '/worker.html#!/service';
        first = '恭喜你成为我们的一员';
        remark = '你已经可以接单了, 快去设置接单条件吧';
        status = '已通过';
    } else {
        first = '很遗憾, 你并未通过我们的护工审核';
        remark = '以后还有机会, 如有疑问请联系我们的客户';
        status = '未通过';
    }
    var data = {
        "first": {
            "value": first,
            "color": "#173177"
        },
        //状态
        "keyword1": {
            "value": status,
            "color": "#173177"
        },
        //申请人
        "keyword2": {
            "value": worker.name,
            "color": "#173177"
        },
        //申请时间
        "keyword3": {
            "value": dateFormat(worker.ctime),
            "color": "#173177"
        },
        "remark": {
            "value": remark,
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["w_reviewResultReminder"],
        url: url,
        data: data
    };
};

var supervisorOrderReminder = function (order) {
    var url = config.url + '/supervisor.html#!/order/' + order.id /*+ '/#mp.weixin.qq.com'*/;
    var data = {
        "first": {
            "value": "有客户需要护工",
            "color": "#173177"
        },
        "keyword1": {
            "value": "快康护理",
            "color": "#173177"
        },
        "keyword2": {
            "value": "护工服务",
            "color": "#173177"
        },
        "keyword3": {
            "value": timeFormat(order.createdAt),
            "color": "#173177"
        },
        "keyword4": {
            "value": order.price + " 元",
            "color": "#173177"
        },
        "keyword5": {
            "value": "客户未支付",
            "color": "#173177"
        },
        "remark": {
            "value": "请尽快联系客户确认床位等详细信息, 确认付款, 签订纸质合同",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["s_orderReminder"],
        url: url,
        data: data
    };
};

var supervisiorSuccessReminder = function () {
    var data = {
        "first": {
            "value": "您好, 已成功成为医院负责人",
            "color": "#173177"
        },
        "keyword1": {
            "value": "",
            "color": "#173177"
        },
        "keyword2": {
            "value": "快康护理",
            "color": "#173177"
        },
        "keyword3": {
            "value": moment().format("YYYY年MM月DD日 hh:mm:ss"),
            "color": "#173177"
        },
        "remark": {
            "value": "欢迎您的加入",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["s_successReminder"],
        url: "",
        data: data
    };
};

var supervisorWorkerQueueReminder = function (content) {
    var url = "";
    var data = {
        "first": {
            "value": "今天的护工排班情况",
            "color": "#173177"
        },
        "keyword1": {
            "value": content.join("\n"),
            "color": "#173177"
        },
        "keyword2": {
            "value": moment().format('HH:mm:ss'),
            "color": "#173177"
        },
        "remark": {
            "value": "回复 排班 可以随时获取最新的护工排班信息",
            "color": "#173177"
        }
    };
    return {
        templateId: templateIdMap["w_orderReminder"],
        url: url,
        data: data
    };
};

var couponMsg = function () {
  return [
      {
          title: '当月最新优惠',
          picurl: 'http://open.web.meitu.com/sources/images/1.jpg',
          url: config.url + '/coupon.html'
      },
      {
          title: '护工一日体验活动',
          picurl: 'http://open.web.meitu.com/sources/images/1.jpg',
          url: config.url + '/worker.html#!/auth'
      },
      {
          title: '五星护工限时优惠',
          picurl: 'http://open.web.meitu.com/sources/images/1.jpg',
          url: config.url + '/worker.html#!/auth'
      },
      {
          title: '套餐八折优惠',
          picurl: 'http://open.web.meitu.com/sources/images/1.jpg',
          url: config.url + '/worker.html#!/auth'
      }
  ];
};

var acceptOrderMsg = function (title, description) {
    return [
        {
            title: title,
            description: description,
            url: config.url + '/worker.html#!/service'
        }
    ]
};

exports.cRemainder = customerCheckinReminder;
exports.cUnpaidOrder = customerUnpaidOrder;
exports.cProcessingOrder = customerProcessingOrder;
exports.cConfirmedOrder = customerConfirmedOrder;
exports.cFinishedOrder = customerFinishedOrder;
exports.cRefundingReminder = customerRefundingOrderReminder;
exports.cRenewReminder = customerRenewOrderReminder;
exports.cHandleRemider = customerHandleOrderReminder;
exports.cRefundedReminder = customerRefundedOrderReminder;

exports.wConfirmOrder = workerComfirmedOrderReminder;
exports.wProcessingOrder = workerProcessingOrder;
exports.wWorkReminder = workerOrderReminder;
exports.wCheckinReminder = workerCheckinReminder;
exports.wSalaryReminder = workerSalaryReminder;
exports.wReviewResultReminder = workerReviewResultReminder;

exports.sOrderReminder = supervisorOrderReminder;
exports.sSuccessReminder = supervisiorSuccessReminder;
exports.sWorkerQueueReminder = supervisorWorkerQueueReminder;

exports.cCoupon = couponMsg;
exports.wAccept = acceptOrderMsg;
exports.dateF = dateFormat;