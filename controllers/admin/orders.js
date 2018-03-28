"use strict";
const _ = require('lodash');
const co = require('co');
const Observable = require('rx').Observable;
const Order = require('../../models').order;
const OrderWork = require('../../models').orderWork;
const Work = require('../../models').work;
const OrderRating = require('../../models').orderRating;
const OrderStatus = require('../../models').orderStatus;
//const MessageSender = require('../../business/wxMessageSender');
const Permissions = require('../../setup/adminPermissions');
const errors = require('../../errors');
const moment = require('moment');
const OrderManager = require('../../business/orderManager');
//const WorkSchedule = require('../../business/workerSchedule');
const dateUtils = require('../../utils/dateUtils');

const findOrder = function (req, res, next) {
    let orderId = req.params.orderId;
    if (!orderId) {
        throw new Error("This should apply on router which have 'orderId' params");
    }
    co(function *() {
        let order = yield Order.query(orderId);
        if (order === null) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
            return next(error);
        }
        req.order = order;
        next();
    }).catch(function (err) {
        return next(err);
    });
};

const findOrderIncludeDeleted = function (req, res, next) {
    let orderId = req.params.orderId;
    if (!orderId) {
        throw new Error("This should apply on router which have 'orderId' params");
    }
    co(function *() {
        let order = yield Order.query(orderId);
        if (order === null) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
            return next(error);
        }
        req.order = order;
        next();
    }).catch(function (err) {
        return next(err);
    });
};

const getOrders = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    let ids = queryUtils.parseQueryIds(req.query.id);
    let hospitalIds = queryUtils.parseQueryIds(req.query.hospitalId);
    let customerIds = queryUtils.parseQueryIds(req.query.customerId);
    let workIds = queryUtils.parseQueryIds(req.query.workId);
    let statuses = queryUtils.parseQueryStrings(req.query.status, Order.STATUS);
    let patientGenders = queryUtils.parseQueryStrings(req.query.patientGender, Order.GENDER);
    let workerGenders = queryUtils.parseQueryStrings(req.query.workerGender, Order.GENDER);
    let tradeNumbers = queryUtils.parseQueryStrings(req.query.tradeNum);
    let dependentLevels = queryUtils.parseQueryStrings(req.query.dependentLevel, Order.DEPENDENT_LEVEL);
    let nursingTimes = queryUtils.parseQueryStrings(req.query.nursingTime, Order.NURSING_TIME);
    let sort = queryUtils.parseSortStrings(req.query.sort, Order.FIELD_ID, Order.SORTABLE_FIELDS);
    let q = req.query.q || null;

    let options = {
        query: {},
        pagination: req.pagination,
        sort: sort,
        q: q
    };

    options.query.ids = ids;
    options.query.hospitalIds = hospitalIds;
    options.query.customerIds = customerIds;
    options.query.workIds = workIds;
    options.query.statuses = statuses;
    options.query.patientGenders = patientGenders;
    options.query.workerGenders = workerGenders;
    options.query.tradeNumbers = tradeNumbers;
    options.query.dependentLevels = dependentLevels;
    options.query.nursingTimes = nursingTimes;

    co(function *() {
        let result = yield Order.queryAll(options);
        res.setHeader('X-Total-Count', result.count);
        return res.jsonp(result.rows);
    }).catch(function (err) {
        return next(err);
    });
};

const getOrdersId = function (req, res, next) {
    return res.jsonp(req.order);
};

const deleteOrdersId = function (req, res, next) {
    req.order.destroy().then(function (order) {
        return res.jsonp(order);
    }).catch(function (err) {
        return next(err);
    });
};

const patchOrdersId = function (req, res, next) {
    co(function *() {
        let order = req.order;
        //let newDayPrice = req.body.dayPrice;
        let newprice = req.body.price;
        
        if (order.status !== Order.STATUS_UNPAID) {
            throw errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS);
        }

        // if (isNaN(newDayPrice) || newDayPrice <= 0) {
        //     throw errors.newError(errors.types.TYPE_API_BAD_REQUEST);
        // }
        if (isNaN(newprice) || newprice <= 0) {
            throw errors.newError(errors.types.TYPE_API_BAD_REQUEST);
        }

        // let serviceDays = order.price / order.dayPrice;
        // let newPrice = newDayPrice * serviceDays;

        //order.price = newPrice;
        order.price = newprice;        
        //order.dayPrice = newDayPrice;
        order.amount = newprice;
        order = yield order.save();

        return res.jsonp(order);

    }).catch(function(err) {
        return next(err);
    });
};

const getOrdersIdRating = function (req, res, next) {
    co(function*() {
        let orderRating = yield req.order.getOrderRating();
        if (!orderRating) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_RATING_NOT_FOUND);
            return next(error);
        }
        return res.jsonp(orderRating);
    }).catch(function (err) {
        return next(err);
    });
};

const deleteOrdersIdRating = function (req, res, next) {
    co(function*() {
        let orderRating = yield req.order.getOrderRating();
        if (!orderRating) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_RATING_NOT_FOUND);
            return next(error);
        }
        yield orderRating.destroy();
        return res.jsonp(orderRating);
    }).catch(function (err) {
        return next(err);
    });
};

const putOrdersIdRating = function (req, res, next) {
    let comment = req.body.comment;
    let rating = req.body.rating;
    let order = req.order;
    if (order.status !== Order.STATUS_COMPLETED) {
        let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_COMPLETE);
        return next(error);
    }
    let value = {
        orderId: order.id,
        comment: comment,
        rating: rating
    };
    co(function*() {
        let orderRating = yield order.getOrderRating();
        if (orderRating) {
            yield orderRating.update(value);
        } else {
            orderRating = yield OrderRating.create(value);
        }
        return res.jsonp(orderRating);
    }).catch(function (err) {
        return next(err);
    });
};

const putOrdersIdRefund = function (req, res, next) {
    co(function*() {
        let order = req.order;
        let user = req.user;
        // 可重试
        if (!order.canRefund() && order.status !== Order.STATUS_REFUND_PENDING
            && order.status !== Order.STATUS_REFUNDING) {
            return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        }
        if (order.status !== Order.STATUS_REFUND_PENDING && order.status !== Order.STATUS_REFUNDING) {
            yield order.markRefundPending();
            yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_REFUND_PENDING, user.id);
        }

        order = yield OrderManager.refundOrder(order, user.id);
        return res.jsonp(order);
    }).catch(function (err) {
        return next(err);
    });
};

const putOrdersIdSubstitute = function (req, res, next) {
    co(function*() {
        let order = req.order;
        let user = req.user;
        let workId = req.body.workId;
        let timezone = "Asia/Shanghai";
        let now = moment.tz(timezone);
        let lessThanOneHour = yield order.isProgressedDurationLessThanOneHour();
        if (!lessThanOneHour && order.getRemainServiceDays(now) <= 0) {
            throw errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS);
        }
        if (!order.canSubstitute() && order.status !== Order.STATUS_SUBSTITUTE_PENDING) {
            throw errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS);
        }
        if (order.status !== Order.STATUS_SUBSTITUTE_PENDING) {
            yield order.markSubstitutePending();
            yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_SUBSTITUTE_PENDING, user.id);
        }
        let workProvideBySchedule = function () {
            let params = {
                orderId: order.id,
                workId: workId
            };
            return OrderManager.takeAvailableWorkByOrder(params);
        };
        let newOrder = yield OrderManager.substituteOrder(order, workProvideBySchedule, user.id);
        res.jsonp(newOrder);
        return null;
    }).catch(function (err) {
        return next(err);
    });
};

const putOrdersIdCancel = function (req, res, next) {
    co(function *() {
        let order = req.order;
        let user = req.user;
        if (!order.canCancel()) {
            return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        }
        yield OrderManager.cancelOrder(order, user.id);
        yield order.reload();
        return res.jsonp(order);
    }).catch(function (err) {
        return next(err);
    });
};
const putOrdersIdEnd = function (req, res, next) {
    co(function *() {
        let order = req.order;
        let user = req.user;
        // if (!order.canCancel()) {
        //     return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        // }
        if (!order.canCompleted()) {
            return next(errors.newError(errors.types.TYPE_API_ORDER_INVALID_STATUS));
        };
        yield OrderManager.endOrder(order, user.id);
        yield order.reload();
        return res.jsonp(order);
    }).catch(function (err) {
        return next(err);
    });
};

const getUnresolvedOrders = function (req, res, next) {
    co(function*() {
        let orders = yield Order.queryAllPending();
        return res.jsonp(orders);
    }).catch(function (err) {
        return next(err);
    });
};

const getExpiringOrders = function (req, res, next) {
    co(function *() {
        let progressingOrders = yield Order.queryAllOrdersByStatus([Order.STATUS_PROGRESSING]);
        let now = new Date();
        let orders = [].concat(_.filter(progressingOrders, function(progressingOrder) {
            let order = progressingOrder.toJSON();
            let renewIndex = _.findIndex(order.orderStatuses, function (status) {
                return status === OrderStatus.STATUS_RENEW;
            });
            return dateUtils.daysBetween(now, order.endDate) === 0 && renewIndex === -1;
        }));

        return res.jsonp(orders);
    }).catch(function (err) {
        return next(err);
    });
};

const getOrderStatusDetails = function (req, res, next) {
    co(function*() {
        let orderDetails = yield OrderStatus.queryByOrderId(req.order.id);
        return res.jsonp(orderDetails);
    }).catch(function (err) {
        return next(err);
    });
};

const putOrdersIdRestore = function (req, res, next) {
    co(function *() {
        let order = req.order;
        order = yield order.restore();
        return res.jsonp(order);
    }).catch(function (err) {
        return next(err);
    })
};

const checkPermission = function (permissions) {
    return function (req, res, next) {
        permissions = [].concat(permissions || []);
        if (!permissions.length) {
            return next();
        }
        let admin = req.admin;
        co(function *() {
            let hasPermission = yield admin.hasPermission(permissions);
            if (hasPermission) {
                return next();
            }
            let error = errors.newError(errors.types.TYPE_API_FORBIDDEN);
            return next(error);
        }).catch(function (err) {
            return next(err);
        });
    };
};

const postOrders = function (req, res, next) {
    let hospitalId = req.body.hospitalId;
    let startDate = new Date(req.body.startDate);
    let endDate = new Date(req.body.endDate);
    let patientGender = req.body.patientGender;
    let workerGender = req.body.workerGender;
    let dependentLevel = req.body.dependentLevel;
    let nursingTime = req.body.nursingTime;
    let msg = req.body.msg;
    let user = req.user;
    let customerId = req.body.customerId || user.id;
    const workId = req.body.workId;

    let orderOptions = {
        customerId: customerId,
        hospitalId: hospitalId,
        workerGender: workerGender,
        patientGender: patientGender,
        nursingTime: nursingTime,
        dependentLevel: dependentLevel,
        startDate: startDate,
        endDate: endDate,
        msg: msg,
        user: user,
        workId: workId
    };

    co(function *() {
        let workProvideBySchedule = function () {
            return OrderManager.takeAvailableWork(orderOptions);
        };
        let result = yield OrderManager.createOrder(orderOptions, workProvideBySchedule);
        let order = result.order;
        let orderWork = result.orderWork;

        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_UNPAID, user.id);
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_ASSIGNED, 1);
        if (workId) {
            yield orderWork.acceptOrder();
            yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_ACCEPT, 1);
        }
        if (orderWork) {
            MessageSender.sendOrderCreatedMessage(order, orderWork, false, false);
        }
        res.jsonp(order);
    }).catch(function (err) {
        next(err);
    });
};

const putOrdersIdRenew = function (req, res, next) {
    let order = req.order;
    let endDate = req.body.endDate;
    let user = req.user;

    co(function *() {

        let newOrder = yield OrderManager.renewOrder({
            order: order,
            user: user,
            endDate: endDate
        });

        //记录状态: 被续单   --Call Center
        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_RENEW, user.id);
        //记录状态: 新订单   --系统
        yield OrderStatus.logStatus(newOrder.id, OrderStatus.STATUS_UNPAID, user.id);
        //记录状态: 护工确认  --系统
        //yield OrderStatus.logStatus(newOrder.id, OrderStatus.STATUS_ACCEPT, 1);

        let orderWork = yield newOrder.getCurrentOrderWork();
        if (orderWork) {
            MessageSender.sendOrderCreatedMessage(newOrder, orderWork, false, false);
        }
        return res.jsonp(newOrder);
    }).catch(function (err) {
        return next(err);
    });
};

const dev_updateStatus = function(req, res, next) {
    let order = req.order;
    let user = req.user;
    let Payment = require('../../models').payment;
    let scheduleTask = require('../../lib/scheduleTask');

    co(function *() {
        yield order.update({
            status: Order.STATUS_PAID
        });

        let payment = yield Payment.create({
            payerId: user.id,
            orderId: order.id,
            object: ""
        });
        yield order.addPayment(payment);

        let orderSigned = (yield Order.update({
            status: Order.STATUS_SIGNED
        }, {
            where: {
                id: order.id,
                status: Order.STATUS_PAID,
                workId: {
                    $ne: null
                }
            }
        }))[0];

        yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_PAID, user.id);

        if (orderSigned) {
            yield OrderStatus.logStatus(order.id, OrderStatus.STATUS_SIGNED);
            scheduleTask.tempTask(order);
        }
        return res.jsonp(order);
    }).catch(function (err) {
        console.log(err);
    })
};
//通过userId获取订单信息yzl admin
const getUserOrderByUserId = function (req, res, next) {
    let userId = req.params.userId;
    if (!userId) {
            let error = errors.newError(errors.types.TYPE_API_USERID_NOT_FOUND);
            return next(error);
    }
    let options = {
        query: {},
        pagination:req.pagination
    };
    options.query.userId = userId;
    co(function *() {
        let orders = yield Order.GetUserOrderByUserId(options);
        if (orders === null) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
            return next(error);
        }

        //获取总页数,因为参数只有userId，就不存在因为查询其他参数而导致数据分页出现问题
        let totalPages;
            let page = {
                query: {},
                pagination:{page:1,limit:1000}
            };
            page.query.userId = userId;
            let pages = yield Order.GetUserOrderByUserId(page);
            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;

        let retunrnOrders={
                totalPages:totalPages,
                orderNum:orders.length,
                data:orders
        };
        return res.jsonp(retunrnOrders);
    }).catch(function (err) {
        return next(err);
    });
};

//通过workId获取订单信息yzl admin
const getWorkOrderByWorkId = function (req, res, next) {
    let workId = req.params.workId;
    if (!workId) {
            let error = errors.newError(errors.types.TYPE_API_USERID_NOT_FOUND);
            return next(error);
    }
    let options = {
        query: {},
        pagination:req.pagination
    };
    options.query.workId = workId;
    co(function *() {
        let orders = yield Order.getWorkOrderByWorkId(options);
        if (orders === null) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
            return next(error);
        }

        //获取总页数,因为参数只有userId，就不存在因为查询其他参数而导致数据分页出现问题
        let totalPages;
            let page = {
                query: {},
                pagination:{page:1,limit:1000}
            };
            page.query.workId = workId;
            let pages = yield Order.getWorkOrderByWorkId(page);
            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;

        let retunrnOrders={
                totalPages:totalPages,
                orderNum:orders.length,
                data:orders
        };
        return res.jsonp(retunrnOrders);
    }).catch(function (err) {
        return next(err);
    });
};
//通过orderId获取订单信息 yzl admin
const getUserOrderByOrderId= function (req, res, next) {
    let orderId = req.query.orderId;
    if (!orderId) {
            let error = errors.newError(errors.types.TYPE_API_USERID_NOT_FOUND);
            return next(error);
    }
   
    co(function *() {
        let orders = yield Order.GetUserOrderByOrderId(orderId);
        if (orders === null) {
            let error = errors.newError(errors.types.TYPE_API_ORDER_NOT_FOUND);
            return next(error);
        }

        return res.jsonp(orders);
    }).catch(function (err) {
        return next(err);
    });
};
const getAllOrders = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');

    let customerName = queryUtils.parseQueryStrings(req.body.customerName);//客人名
    let workName = queryUtils.parseQueryStrings(req.body.workName);//护工名
    let tradeNum = queryUtils.parseQueryStrings(req.body.tradeNum);//订单号
    let startDate = queryUtils.parseQueryStrings(req.body.startDate);//开始日期
    let endDate = queryUtils.parseQueryStrings(req.body.endDate);//结束日期

    let status = queryUtils.parseQueryStrings(req.body.status);//订单状态
    if(status[0]==='0'){
        status = [];
    };
    let hospitalId = queryUtils.parseQueryIds(req.body.hospitalId);//护理医院
    if(hospitalId[0]===0){
        hospitalId = [];
    };
    let dependentLevel = queryUtils.parseQueryStrings(req.body.dependentLevel);//护理等级
    if(dependentLevel[0]==='0'){
        dependentLevel = [];
    }else if(dependentLevel[0]==='1'){
        dependentLevel[0] = ['level1'];
    }else if(dependentLevel[0]==='2'){
        dependentLevel[0] = ['level2'];
    }else if(dependentLevel[0]==='3'){
        dependentLevel[0] = ['level3'];
    };
    let nursingTime = queryUtils.parseQueryStrings(req.body.nursingTime);//护理时间
    if(nursingTime[0]==='0'){
        nursingTime = [];
    }else if(nursingTime[0]==='1'){
        nursingTime[0] = ['day'];
    }else if(nursingTime[0]==='2'){
        nursingTime[0] = ['night'];
    }else if(nursingTime[0]==='3'){
        nursingTime[0] = ['dayNight'];
    };
    let state = queryUtils.parseQueryStrings(req.body.state);
    if(state[0]==='0'){
        state = [];
    };
    let city = queryUtils.parseQueryStrings(req.body.city);
    if(city[0]==='0'){
        city = [];
    };
    let region = queryUtils.parseQueryStrings(req.body.region);
    if(region[0]==='0'){
        region = [];
    };

    let options = {
        query: {},
        pagination: req.pagination
    };
  
    options.query.customerName = customerName;//模糊查询
    options.query.workName = workName;//模糊查询
    options.query.tradeNum = tradeNum;//模糊查询
    options.query.startDate = startDate;
    options.query.endDate = endDate;
    options.query.status = status;
    options.query.hospitalId = hospitalId;
    options.query.dependentLevel = dependentLevel;
    options.query.nursingTime = nursingTime;
    options.query.state = state;
    options.query.city = city;
    options.query.region = region;

    co(function *() {
        let orders = yield Order.queryAllOrders(options);
    //如果有的用户没有历史订单信息和已付款信息，那么将两值设为0、接单设置信息
        orders.forEach(function(item,index){
            let order = item.dataValues;
            if(!order.source){
                order.source = '平台';
            };
        });
        //获取总页数
        let totalPages;
        //没有参数时的分页情况，查询所有数据进行总页数的添加
        if(customerName.length===0&&workName.length===0&&tradeNum.length===0&&
            startDate.length===0&&endDate.length===0&&status.length===0&&
            hospitalId.length===0&&dependentLevel.length===0&&nursingTime.length===0
            &&state.length===0&&city.length===0&&region.length===0){
            let page = {
                query: {},
                pagination:{page:1,limit:10000}
            };
            let pages = yield Order.queryAllOrders(page);
            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;
        };
        //有参数时的分页情况，查询该参数的所有数据进行总页数的添加
        if(customerName.length!==0||workName.length!==0||tradeNum.length!==0||
            startDate.length!==0||endDate.length!==0||status.length!==0||
            hospitalId.length!==0||dependentLevel.length!==0||nursingTime.length!==0
            ||state.length!==0||city.length!==0||region.length!==0){
            let page = {
                query: {},
                pagination:{page:1,limit:10000}
            };
            page.query.customerName = customerName;//模糊查询
            page.query.workName = workName;//模糊查询
            page.query.tradeNum = tradeNum;//模糊查询
            page.query.startDate = startDate;
            page.query.endDate = endDate;
            page.query.status = status;
            page.query.hospitalId = hospitalId;
            page.query.dependentLevel = dependentLevel;
            page.query.nursingTime = nursingTime;
            page.query.state = state;
            page.query.city = city;
            page.query.region = region;
        
            let pages = yield Order.queryAllOrders(page);

            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;
        }
        let returnOrders={
                totalPages:totalPages,
                orderNum:orders.length,
                data:orders
        };
        return res.jsonp(returnOrders);
    }).catch(function (err) {
        return next(err);
    });
};


const getUnprocessedOrders = function (req, res, next) {
    let minute = req.body.minute;

    if (!minute || minute.trim().length == 0) {
        minute = 10;
    } else {
        minute = parseInt(minute);
    }
        
    

    let options = {
        query: {minute:minute},
        pagination: req.pagination
    };
  


    co(function *() {
        let orders = yield Order.queryAllUnprocessedOrders(options);
        let totalCount = orders.count;
        console.log(options.pagination.limit)
        let totalPages = totalCount / +options.pagination.limit;
        totalPages = (totalPages > 1)
            ? Math.ceil(+totalPages)//向上取整，有小数就加一
            : 1;


        let returnOrders={
            totalPages:totalPages,
            orderNum:orders.rows.length,
            data:orders.rows
        };
        return res.jsonp(returnOrders);
        

        return res.jsonp(orders);
    //如果有的用户没有历史订单信息和已付款信息，那么将两值设为0、接单设置信息
        orders.forEach(function(item,index){
            let order = item.dataValues;
            if(!order.source){
                order.source = '平台';
            };
        });
        //获取总页数

        //没有参数时的分页情况，查询所有数据进行总页数的添加
        if(customerName.length===0&&workName.length===0&&tradeNum.length===0&&
            startDate.length===0&&endDate.length===0&&status.length===0&&
            hospitalId.length===0&&dependentLevel.length===0&&nursingTime.length===0
            &&state.length===0&&city.length===0&&region.length===0){
            let page = {
                query: {},
                pagination:{page:1,limit:10000}
            };
            let pages = yield Order.queryAllOrders(page);
            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;
        };
        //有参数时的分页情况，查询该参数的所有数据进行总页数的添加
        if(customerName.length!==0||workName.length!==0||tradeNum.length!==0||
            startDate.length!==0||endDate.length!==0||status.length!==0||
            hospitalId.length!==0||dependentLevel.length!==0||nursingTime.length!==0
            ||state.length!==0||city.length!==0||region.length!==0){
            let page = {
                query: {},
                pagination:{page:1,limit:10000}
            };
            page.query.customerName = customerName;//模糊查询
            page.query.workName = workName;//模糊查询
            page.query.tradeNum = tradeNum;//模糊查询
            page.query.startDate = startDate;
            page.query.endDate = endDate;
            page.query.status = status;
            page.query.hospitalId = hospitalId;
            page.query.dependentLevel = dependentLevel;
            page.query.nursingTime = nursingTime;
            page.query.state = state;
            page.query.city = city;
            page.query.region = region;
        
            let pages = yield Order.queryAllOrders(page);

            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;
        }

    }).catch(function (err) {
        return next(err);
    });
};


//########订单查询
//查询订单列表
exports.getAllOrders = [checkPermission(Permissions.ADMIN_ORDERS_LIST), getAllOrders];
//通过userId获取订单信息yzl admin
exports.getUserOrderByUserId = [checkPermission(Permissions.ADMIN_ORDERS_LIST), getUserOrderByUserId];
//通过workId获取订单信息yzl admin
exports.getWorkOrderByWorkId = [checkPermission(Permissions.ADMIN_ORDERS_LIST), getWorkOrderByWorkId];
//通过orderId获取各种信息yzl admin
exports.getUserOrderByOrderId = [checkPermission(Permissions.ADMIN_ORDERS_READ), getUserOrderByOrderId];
//更改订单价格
exports.patchOrdersId = [checkPermission(Permissions.ADMIN_ORDERS_UPDATE), findOrder, patchOrdersId];
//取消订单
exports.putOrdersIdCancel = [checkPermission(Permissions.ADMIN_ORDERS_UPDATE), findOrder, putOrdersIdCancel];
//结束订单
exports.putOrdersIdEnd = [checkPermission(Permissions.ADMIN_ORDERS_UPDATE), findOrder, putOrdersIdEnd];

exports.unprocessedOrders =  [checkPermission(Permissions.ADMIN_ORDERS_LIST), getUnprocessedOrders];


// exports.postOrders = [checkPermission(Permissions.ADMIN_ORDERS_CREATE), postOrders];
// exports.getOrders = [checkPermission(Permissions.ADMIN_ORDERS_LIST), getOrders];
// exports.getUnresolvedOrders = [checkPermission(Permissions.ADMIN_ORDERS_LIST), getUnresolvedOrders];
// exports.getOrdersId = [checkPermission(Permissions.ADMIN_ORDERS_READ), findOrder, getOrdersId];
// exports.deleteOrdersId = [checkPermission(Permissions.ADMIN_ORDERS_DELETE), findOrder, deleteOrdersId];
// exports.patchOrdersId = [checkPermission(Permissions.ADMIN_ORDERS_UPDATE), findOrder, patchOrdersId];
// exports.getOrdersIdRating = [checkPermission(Permissions.ADMIN_ORDERS_UPDATE), findOrder, getOrdersIdRating];
// exports.putOrdersIdRating = [checkPermission(Permissions.ADMIN_ORDERS_UPDATE), findOrder, putOrdersIdRating];
// exports.deleteOrdersIdRating = [checkPermission(Permissions.ADMIN_ORDERS_UPDATE), findOrder, deleteOrdersIdRating];
// exports.getOrderStatusDetails = [checkPermission([Permissions.ADMIN_ORDERS_LIST, Permissions.ADMIN_ORDER_STATUSES_LIST]), findOrder, getOrderStatusDetails];
// exports.getExpiringOrders = [checkPermission(Permissions.ADMIN_ORDERS_LIST), getExpiringOrders];

// exports.putOrdersIdRestore = [checkPermission(Permissions.ADMIN_ORDERS_UPDATE), findOrderIncludeDeleted, putOrdersIdRestore];

// exports.putOrdersIdRefund = [checkPermission(Permissions.ADMIN_ORDERS_REVIEW), findOrder, putOrdersIdRefund];
// exports.putOrdersIdSubstitute = [checkPermission(Permissions.ADMIN_ORDERS_REVIEW), findOrder, putOrdersIdSubstitute];
// exports.putOrdersIdCancel = [checkPermission(Permissions.ADMIN_ORDERS_UPDATE), findOrder, putOrdersIdCancel];
// exports.putOrdersIdRenew = [checkPermission(Permissions.ADMIN_ORDERS_CREATE, Permissions.ADMIN_ORDERS_READ), findOrder, putOrdersIdRenew];

// exports.dev_payStatus = [checkPermission(Permissions.ADMIN_ORDERS_UPDATE), findOrder, dev_updateStatus];