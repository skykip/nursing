"use strict";
const _ = require('lodash');
const Hospital = require('../../models/index').hospital;
const Work = require('../../models/index').work;
const User = require('../../models/index').user;
const Service = require('../../models/index').service;
const Price = require('../../models/index').price;
const Order = require('../../models/index').order;
// const Supervision = require('../../models/index').supervision;
const co = require('co');
const errors = require('../../errors/index');
const Permissions = require('../../setup/adminPermissions');
// const MessageSender = require('../../business/wxMessageSender');
const ReviewLog = require('../../models/index').reviewLog;
// const WXAPI = require('../../lib/wxapi');
// const redisClient = require('../../lib/redisClient').client;
// const workerSchedule = require('../../business/workerSchedule');
// const Punishment = require('../../models/index').punishment;

const findWork = function (req, res, next) {
    let workId = req.params.workId;
    co(function*() {
        let work = yield Work.queryById(workId);
        if (!work) {
            let error = errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND);
            return next(error);
        } 
       let order = yield Order.queryWorkAllCompletedOrder(work.id);
       let orderPrice = yield Order.queryWorkAllpaidOrder(work.id);
       //护工历史订单
       let workOrdersHistory = [];
       //护工已收到付款
       let workOrdersAmount = [];

       //将完成订单放入workOrdersHistory
       if(order.length>0){
        //var workId = order[0].workId;
        var temp ={
            workId:workId,
            orderQuantity:order.length,
            order:[]
        };
        temp.order.push(order);
        workOrdersHistory.push(temp);
    };

    //将已支付订单存入orderPrice
    if(orderPrice.length>0){
        //var workId = orderPrice[0].workId;
        let amount = 0;
        for(let j = 0;j < orderPrice.length;j++){
            amount += +orderPrice[j].amount;
        }
        var temp2 ={
            workId:workId,
            orderAmount:amount,
            orderPrice:[]
        };
        temp2.orderPrice.push(orderPrice);
        workOrdersAmount.push(temp2);
    };
     //为orderQuantity，orderAmount进行赋值
     if(workOrdersHistory.length!==0){
        work.dataValues.orderQuantity = workOrdersHistory[0].orderQuantity;
    }
    if(workOrdersAmount.length!==0){
        work.dataValues.orderAmount = workOrdersAmount[0].orderAmount;
    }

    //如果不存在orderQuantity，orderAmount，则赋值为0
    if(!work.dataValues.orderQuantity){
        work.dataValues.orderQuantity = 0;
    };
    if(!work.dataValues.orderAmount){
        work.dataValues.orderAmount = 0;
    };
    if(!work.dataValues.orderComplain){
        work.dataValues.orderComplain = 0;
    };
        req.work = work;
        return next();
    }).catch(function (err) {
        return next(err);
    });
};

const findWorkIncludeDeleted = function (req, res, next) {
    let workId = req.params.workId;
    co(function*() {
        let work = yield Work.queryById(workId, true);
        if (!work) {
            let error = errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND);
            return next(error);
        }
        req.work = work;
        return next();
    }).catch(function (err) {
        return next(err);
    });
};

let checkWork = function (req, res, next) {
    if (!req.work) {
        throw Error("Should use with findWork");
    }
    if (req.work.status !== Work.STATUS_APPROVED) {
        let error = errors.newError(errors.types.TYPE_API_WORK_NOT_APPROVED);
        return next(error);
    }
    next();
};

let getWorksId = function (req, res, next) {
    return res.jsonp(req.work);
};

let getWorks = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    let ids = queryUtils.parseQueryIds(req.query.id);
    let userIds = queryUtils.parseQueryIds(req.query.userId);
    let statuses = queryUtils.parseQueryStrings(req.query.status, Work.STATUS);
    let genders = queryUtils.parseQueryStrings(req.query.gender, Work.GENDER);
    let hospitalIds = queryUtils.parseQueryIds(req.query.hospitalIds);

    let options = {
        query: {},
        pagination: req.pagination
    };
    options.query.userIds = userIds;
    options.query.ids = ids;
    options.query.statuses = statuses;
    options.query.genders = genders;
    options.query.hospitalIds = hospitalIds;
    co(function *() {
        let works = yield Work.queryAll(options);
        return res.jsonp(works);
    }).catch(function (err) {
        return next(err);
    });
};
//查询所有已删除护工信息
let getWorksDeleted = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    //let userId = queryUtils.parseQueryStrings(req.body.userId);
    //let ids = queryUtils.parseQueryStrings(req.body.id);
    let names = queryUtils.parseQueryStrings(req.body.name);
    let phoneNums = queryUtils.parseQueryStrings(req.body.phoneNum);
    let wechatNames = queryUtils.parseQueryStrings(req.body.wechatName);
    // let startDate = queryUtils.parseQueryStrings(req.body.startDate);
    // let endDate = queryUtils.parseQueryStrings(req.body.endDate);
    let idCardNums = queryUtils.parseQueryStrings(req.body.idCardNum);
    let stars = queryUtils.parseQueryStrings(req.body.star);
    if(stars[0]==='0'){
        stars = [];
    };
    let gender = queryUtils.parseQueryStrings(req.body.gender);
    if(gender[0]==='0'){
        gender = [];
    }else if(gender[0]==='1'){
        gender[0] = ['male'];
    }else if(gender[0]==='2'){
        gender[0] = ['female'];
    };
    let workType = queryUtils.parseQueryStrings(req.body.workType);
    if(workType[0]==='0'){
        workType = [];
    }else if(workType[0]==='1'){
        workType[0] = ['formal'];
    }else if(workType[0]==='2'){
        workType[0] = ['informal'];
    };
    let hospitalId = queryUtils.parseQueryStrings(req.body.hospitalId);
    if(hospitalId[0]==='0'){
        hospitalId = [];
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
    //护工状态（接单中active，休息中inactive，有订单正在进行中progressing）
    //Service.STATUS_ACTIVE Service.STATUS_INACTIVE
    //Order.STATUS_PROGRESSING
    let workStatus = queryUtils.parseQueryStrings(req.body.workStatus);
    if(workStatus[0]==='0'){
        workStatus = [];
    }else if(workStatus[0]==='1'){
        workStatus[0] = [Service.STATUS_ACTIVE];
    }else if(workStatus[0]==='2'){
        workStatus[0] = [Service.STATUS_INACTIVE];
    };
    //status=0 -》所有护工 status=1 -》审核通过护工 status=2 -》待审核护工 
    let status = req.body.status;
    if(status==='0'){
        status = [];
    }else if(status==='1'){
        status = Work.STATUS_APPROVED;
    }else if(status==='2'){
        status = Work.STATUS_CHECKING;
    };
    
    let options = {
        query: {},
        pagination: req.pagination
    };
    //options.query.userIds = userIds;
    //options.query.ids = ids;
    options.query.names = names;//模糊查询
    options.query.phoneNums = phoneNums;//模糊查询
    options.query.wechatNames = wechatNames;//模糊查询
    options.query.idCardNums = idCardNums;//模糊查询
    options.query.stars = stars;
    options.query.gender = gender;
    options.query.workType = workType;
    options.query.hospitalId = hospitalId;
    options.query.state = state;
    options.query.city = city;
    options.query.workStatus = workStatus;

    co(function *() {
        let works = yield Work.queryDeletedWorks(options,status);
        
        //护工ID
        let worksId = [];
        //护工历史订单
        let workOrdersHistory = [];
        //护工已收到付款
        let workOrdersAmount = [];

        //获取所有workId
        works.forEach(function(item,index){
            let work = item.dataValues;
            let workId = work.id;
            worksId.push(workId);
        });

        //通过遍历workId取得历史订单和订单金额
        for(let i = 0;i < worksId.length;i++){
            //获取userId=i的所有已完成订单
            let order = yield Order.queryWorkAllCompletedOrder(worksId[i]);
            //获取userId=i的所有已支付订单
            let orderPrice = yield Order.queryWorkAllpaidOrder(worksId[i]);
           
            //将已完成订单存入order
            if(order.length>0){
                var workId = order[0].workId;
                var temp ={
                    workId:workId,
                    orderQuantity:order.length,
                    order:[]
                };
                temp.order.push(order);
                workOrdersHistory.push(temp);
            };
            //将已支付订单存入orderPrice
            if(orderPrice.length>0){
                var workId = orderPrice[0].workId;
                let amount = 0;
                for(let j = 0;j < orderPrice.length;j++){
                    amount += +orderPrice[j].amount;
                }
                var temp2 ={
                    workId:workId,
                    orderAmount:amount,
                    orderPrice:[]
                };
                temp2.orderPrice.push(orderPrice);
                workOrdersAmount.push(temp2);
            };
        };
        //将历史订单信息放入works中
    for(let j = 0 ; j<workOrdersHistory.length;j++){
        for(let i = 0 ;i < works.length ;i++){
            let workId = works[i].id;
            if(workId === workOrdersHistory[j].workId){
                works[i].dataValues.orderQuantity = workOrdersHistory[j].orderQuantity;
            };
        };
    };
    //将已付款信息放入users中
    for(let k = 0; k < workOrdersAmount.length;k++){
        for(let i = 0 ;i < works.length ;i++){
            let workId = works[i].id;
            if(workId === workOrdersAmount[k].workId){
                works[i].dataValues.orderAmount = workOrdersAmount[k].orderAmount;
            };
        };
    };
    //如果有的用户没有历史订单信息和已付款信息，那么将两值设为0、接单设置信息
         works.forEach(function(item,index){
            let work = item.dataValues;
            if(!work.orderQuantity){
                work.orderQuantity = 0;
            };
            if(!work.orderAmount){
                work.orderAmount = 0;
            };
            if(!work.orderComplain){
                work.orderComplain = 0;
            };
            if(!work.services){
                work.workStatus = 0;
                work.worStatus_desc = '休息中';
            };
            if(work.services.length!==0&&work.services[0].status==='active'){
                work.workStatus = 1;
                work.worStatus_desc = '服务中';
            }else{
                work.workStatus = 0;
                work.worStatus_desc = '休息中';
            };
            
        });
        //获取总页数
        let totalPages;
        //没有参数时的分页情况，查询所有数据进行总页数的添加
        if(names.length===0&&phoneNums.length===0&&wechatNames.length===0&&
            idCardNums.length===0&&stars.length===0&&gender.length===0&&
            workType.length===0&&hospitalId.length===0&&state.length===0
            &&city.length===0&&workStatus.length===0){
            let page = {
                query: {},
                pagination:{page:1,limit:10000}
            };
            let pages = yield Work.queryDeletedWorks(page,status);
            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;
        };
        //有参数时的分页情况，查询该参数的所有数据进行总页数的添加
        if(names.length!==0||phoneNums.length!==0||wechatNames.length!==0||
            idCardNums.length!==0||stars.length!==0||gender.length!==0||
            workType.length!==0||hospitalId.length!==0||state.length!==0
            ||city.length!==0||workStatus.length!==0){
            let page = {
                query: {},
                pagination:{page:1,limit:10000}
            };
            page.query.names = names;//模糊查询
            page.query.phoneNums = phoneNums;//模糊查询
            page.query.wechatNames = wechatNames;//模糊查询
            page.query.idCardNums = idCardNums;//模糊查询
            page.query.stars = stars;
            page.query.gender = gender;
            page.query.workType = workType;
            page.query.hospitalId = hospitalId;
            page.query.state = state;
            page.query.city = city;
            page.query.workStatus = workStatus;
            let pages = yield Work.queryDeletedWorks(page,status);

            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;
        }
        let returnWorks={
                totalPages:totalPages,
                workNum:works.length,
                data:works
        };
        return res.jsonp(returnWorks);
    }).catch(function (err) {
        return next(err);
    });
};

let getWorksAvailable = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    let ids = queryUtils.parseQueryIds(req.query.id);
    let userIds = queryUtils.parseQueryIds(req.query.userId);
    let statuses = queryUtils.parseQueryStrings(req.query.status, Work.STATUS);
    let genders = queryUtils.parseQueryStrings(req.query.gender, Work.GENDER);
    let hospitalIds = queryUtils.parseQueryIds(req.query.hospitalIds);
    if (hospitalIds && hospitalIds.length) {
        co(function *() {
            let hospital = yield Hospital.queryById(hospitalIds[0]);
            let cityKey = 'city:' + hospital.city;
            redisClient.get(cityKey, function (err, reply) {
                var result = JSON.parse(reply);
                if (!err && result && result.length > 0) {
                    return res.jsonp(result);
                } else {
                    return next(err);
                }
            });
        }).catch(function(err) {
            return next(err);
        });
    } else {
        next(new Error("No hospitalId"));
    }
};

let deleteWorksId = function (req, res, next) {
    co(function*() {
        let work = req.work;
        yield work.destroy();
        let retunrnWork = {
            status:1,
            Msg:'回收成功',
            data:work
        };
        return res.jsonp(retunrnWork);
    }).catch(function (err) {
        return next(err);
    });
};

let approveWorksId = function (req, res, next) {
    let work = req.work;
    //let priceId = req.body.priceId;
    let workType = req.body.workType;
    co(function *() {
        //TODO::应该是查找指定模版,这里先选择最早的模版吧
        // let price = yield Price.findOne({
        //     order: [['ctime', 'ASC']]
        // });
        
        work.status = Work.STATUS_APPROVED;
        //work.priceId = priceId;
        work.workType = workType;
        work = yield work.save();
        //记录在ReviewLog表中的userId是当前审核该护工的userId,也就是当前管理员的id
        yield ReviewLog.logReview(work.id, work.status, req.user.id);
        //MessageSender.sendWorkerReviewResultMessage(work);
        return res.jsonp(work);
    }).catch(function (err) {
        return next(err);
    });
};

let disapproveWorksId = function (req, res, next) {
    let work = req.work;
    co(function *() {
        work.status = Work.STATUS_DISAPPROVED;
        work = yield work.save();
        yield ReviewLog.logReview(work.id, work.status, req.user.id);
        //MessageSender.sendWorkerReviewResultMessage(work);
        return res.jsonp(work);
    }).catch(function (err) {
        return next(err);
    });
};

let postWorks = function (req, res, next) {
    let name = req.body.name;
    let idCardNum = req.body.idCardNum;
    let gender = req.body.gender;
    let description = req.body.description;
    let avatar = req.body.avatar;
    let exp = req.body.exp;
    let userId = req.body.userId;

    if (!userId) {
        let error = errors.newError(errors.types.TYPE_API_WORK_NULL_USER_ID);
        return next(error);
    }

    let options = {
        name: name,
        idCardNum: idCardNum,
        gender: gender,
        description: description,
        avatar: avatar,
        exp: exp,
        status: Work.STATUS_CHECKING,
        userId: userId
    };

    co(function*() {
        let work = yield Work.create(options);
        return res.jsonp(work);
    }).catch(function (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            err = errors.newError(errors.types.TYPE_API_WORK_CONFLICT);
        }
        return next(err);
    });
};

const patchWorksId = function (req, res, next) {
    let work = req.work;
    let user = work.user;
    let paymentMethod = work.paymentMethod;
    
    //work参数
    let name = req.body.name;
    let phoneNum = req.body.phoneNum;
    //let status = req.body.status;
    let star = req.body.star;
    let workType = req.body.workType;
    let gender = req.body.gender;
    let idCardNum = req.body.idCardNum;
    //user参数
    let wechatName = req.body.wechatName;
    //paymentMethod参数
    let bankName = req.body.bankName;
    let cardNum = req.body.cardNum;
    let address = req.body.address;
    //service参数
 
    co(function *() {
        //护工信息更新
        work.name = name;
        work.phoneNum = phoneNum;
        //work.status = status;
        work.star = star;
        work.workType = workType;
        work.gender = gender;        
        work.idCardNum = idCardNum;
        work = yield work.save();
        //用户信息更新
        user.wechatname = wechatName;
        yield user.save();
        //银行卡信息更新
        paymentMethod.bank = bankName;
        paymentMethod.cardNum = cardNum;
        paymentMethod.address = address;
        yield paymentMethod.save();

        return res.jsonp(work);
    }).catch(function (err) {
        return next(err);
    });
};

const patchAvatar = function (req, res, next) {
    let user = req.work.user;
    let avatarUrl = req.body.url;
    let work = req.work;

    co(function *() {
        user.avatar = avatarUrl;
        yield user.save();
        work.avatar = avatarUrl;
        work = yield work.save();
        //var work = yield Work.queryById(req.work.id);
        return res.jsonp(work);
    }).catch(function (err) {
        return next(err);
    })
};

const putWorksIdChange = function (req, res, next) {
    let work = req.work;
    let hospitalId = req.body.hospitalId;
    let options = {
        name: work.name,
        gender: work.gender,
        phoneNum: work.phoneNum,
        idCardNum: work.idCardNum,
        hospitalId: hospitalId,
        userId: work.user.id
    };

    co(function *() {
        //资料转移到督工
        let supervision = yield Supervision.create(options);
        //微信转到督工分组
        WXAPI.moveSupervisor(work.user.openId);
        MessageSender.sendSuccessMessage(work.user.openId);
        //删除护工里的记录
        yield work.destroy();
        return res.jsonp(supervision);
    }).catch(function (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            err = errors.newError(errors.types.TYPE_API_SUPERVISION_CONFLICT);
        }
        return next(err);
    });
};

const getPaymentMethod = function (req, res, next) {
    let work = req.work;

    co(function*() {
        let paymentMethod = yield work.getPaymentMethod();
        if (paymentMethod) {
            return res.jsonp(paymentMethod);
        } else {
            let error = errors.newError(errors.types.TYPE_API_WORK_PAYMENT_METHOD_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};

const deletePaymentMethod = function (req, res, next) {
    let work = req.work;
    co(function*() {
        let paymentMethod = yield work.getPaymentMethod();
        if (paymentMethod) {
            yield work.setPaymentMethod(null);
            return res.jsonp(paymentMethod);
        } else {
            let error = errors.newError(errors.types.TYPE_API_WORK_PAYMENT_METHOD_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};

const putPaymentMethod = function (req, res, next) {
    let name = req.body.name;
    let cardNum = req.body.cardNum;
    let work = req.work;
    let bank = req.body.bank;
    co(function*() {
        yield work.createPaymentMethod({
            name: name,
            cardNum: cardNum,
            bank: bank
        });
        let paymentMethod = yield work.getPaymentMethod();
        return res.jsonp(paymentMethod);
    }).catch(function (err) {
        return next(err);
    });
};

const getService = function (req, res, next) {
    let work = req.work;

    co(function*() {
        let service = work.formatService();
        if (service) {
            return res.jsonp(service);
        } else {
            let error = errors.newError(errors.types.TYPE_API_WORK_SERVICE_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};

const patchService = function (req, res, next) {
    let work = req.work;
    let workId = work.id;
    let status = req.body.status;

    co(function*() {
        yield Service.update({
            status: status
        }, {
            where: {
                workId: workId
            }
        });
        // 更新护工队列
        workerSchedule.updateQueue(workId);
        return res.status(204).end();
    }).catch(function (err) {
        return next(err);
    });
};

const filterInvalidEnum = function (array, enums) {
    return _.filter(array, function (obj) {
        return _.indexOf(enums, obj) >= 0;
    });
};

const putService = function (req, res, next) {

    co(function*() {
        let state = req.body.state;
        let city = req.body.city;
        let region = req.body.region;
        let status = req.body.status || Service.STATUS_ACTIVE;
        let patientGenders = req.body.patientGender;
        let nursingTimes = req.body.nursingTime;
        let dependentLevels = req.body.dependentLevel;
        let hospitalIds = req.body.hospitalIds;
        let work = req.work;

        patientGenders = [].concat(patientGenders || []);
        nursingTimes = [].concat(nursingTimes || []);
        dependentLevels = [].concat(dependentLevels || []);
        hospitalIds = [].concat(hospitalIds || []);

        patientGenders = filterInvalidEnum(patientGenders, Service.GENDER);
        nursingTimes = filterInvalidEnum(nursingTimes, Service.NURSING_TIME);
        dependentLevels = filterInvalidEnum(dependentLevels, Service.DEPENDENT_LEVEL);

        if (!patientGenders.length || !nursingTimes.length || !dependentLevels.length) {
            let error = errors.newError(errors.types.TYPE_API_WORK_SERVICE_INVALID);
            return next(error);
        }
        if (!state) {
            let error = errors.newError(errors.types.TYPE_API_WORK_NULL_STATE);
            return next(error);
        }
        if (!city) {
            let error = errors.newError(errors.types.TYPE_API_WORK_NULL_CITY);
            return next(error);
        }
        let hospitals = yield Hospital.queryByIds(hospitalIds);
        if (hospitals.length !== hospitalIds.length) {
            let error = errors.newError(errors.types.TYPE_API_WORK_NOT_SUPPORT_CITY);
            return next(error);
        }
        let services = [];
        patientGenders.forEach(function (patientGender) {
            nursingTimes.forEach(function (nursingTime) {
                dependentLevels.forEach(function (dependentLevel) {
                    hospitalIds.forEach(function (hospitalId) {
                        services.push({
                            patientGender: patientGender,
                            nursingTime: nursingTime,
                            dependentLevel: dependentLevel,
                            workId: work.id,
                            state: state,
                            city: city,
                            region: region,
                            status: status,
                            hospitalId: hospitalId
                        });
                    });
                });
            });
        });

        yield Service.deleteAndCreate(work.id, services);
        // 更新护工队列
        workerSchedule.updateQueue(work.id);
        return res.jsonp({
            status: status,
            patientGender: dependentLevels,
            nursingTime: nursingTimes,
            dependentLevel: dependentLevels,
            state: state,
            city: city,
            region: region,
            hospitals: hospitals
        });
    }).catch(function (err) {
        return next(err);
    });
};

const patchPrices = function (req, res, next) {
    co(function*() {
        let price = yield Price.queryById(req.body.priceId);
        if (!price) {
            let error = errors.newError(errors.types.TYPE_API_PRICE_NOT_FOUND);
            return next(error);
        } else {
            let worker = req.work;
            worker.priceId = price.id;
            worker = yield worker.save();
            return res.jsonp(worker);
        }
    }).catch(function (err) {
        return next(err);
    });
};

const patchBulkPrices = function (req, res, next) {
    co(function*() {
        let price = yield Price.queryById(req.body.priceId);
        if (!price) {
            let error = errors.newError(errors.types.TYPE_API_PRICE_NOT_FOUND);
            return next(error);
        } else {
            let workerIds = [];
            let workers = req.body.works;
            for (let i = 0; i < workers.length; ++i) {
                workerIds.push(workers[i].id);
                workers[i].priceId = price.id;
            }
            yield Work.updatePrices(workerIds, price.id);
            return res.jsonp(workers);
        }
    }).catch(function (err) {
        return next(err);
    });
};

const restoreWorksId = function (req, res, next) {
    let work = req.work;
    co(function *() {
        yield work.restore();
        let returnWork = {
            status:0,
            msg:'恢复成功',
            data:work
        };
        return res.jsonp(returnWork);
    }).catch(function (err) {
        return next(err);
    });
};

const putWorkPunishment = function (req, res, next) {
    let work = req.work;
    var date = new Date(req.body.endDate);
    date.setHours(23,59,59,0);
    co(function *() {
        var punishment = yield Punishment.queryByWorkId(work.id);
        if (punishment) {
            punishment.endDate = date;
            yield punishment.save();
        } else {
            yield Punishment.create({
                workId: work.id,
                endDate: date
            });
        }

        workerSchedule.updateQueue(work.id);

        return res.jsonp(work);
    }).catch(function (err) {
        return next(err);
    });
};

const putWorkPunishmentCancel = function (req, res, next) {
    let work = req.work;
    co(function *() {
        yield Punishment.destroy({
            where: {
                workId: work.id
            }
        });

        workerSchedule.updateQueue(work.id);

        return res.jsonp(work);
    }).catch(function (err) {
        return next(err);
    });
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

//查找待认证护工(基本信息和认证信息都完成)yzl########admin
const getCheckingWorksList = function (req, res, next) {
    let options = {
        pagination: req.pagination
    };
    // let options1 = {
    //     pagination: {
    //         page:1,
    //         limit:10000
    //     }
    // };
        co(function *() {
            let works = yield Work.queryWorksAuth(options);
            //以下的笨方法是把所有checkingwork找出来，手动按各类条件进行分解
            // let notBasicInfoWorks = [];
            // let notAuthInfooWorks = [];
            // for(var i = 0;i < works.length;i++){
            //     let obj = works[i].dataValues;
            //     if(obj.name===null||obj.gender===null||obj.idCardNum===null
            //         ||obj.phoneNum===null||obj.birthday===null||obj.level===null
            //         ||obj.prov===null||obj.city===null||obj.exp===null
            //         ||obj.priceId===null||obj.avatar===null||obj.description===null){
            //             notBasicInfoWorks.push(obj.id);
            //     }else if(obj.idCardFrontPic===null||obj.idCardBackPic===null
            //         ||obj.healthCardPic===null){
            //             notAuthInfooWorks.push(obj.id);
            //     };
            // };
            
            // //使用逆向循环实现如果想判定两个数组中是否有相同元素，使用正向循环会因为index次序改变而错误
            // for(var i = works.length-1;i>=0;i--){
            //     let workId = works[i].id;
            //     for(var j = 0 ;j<notBasicInfoWorks.length;j++){
            //         if(workId===notBasicInfoWorks[j]){
            //             works.splice(i,1);
            //         };
            //     };
            // };
            works.forEach(function(item,index){
                let basicInfo = '1';
                let basicInfo_desc = '已完成';
                let authInfo  = '已完成';
                let authInfo_desc  = '1';
                item.dataValues.basicInfo = basicInfo;
                item.dataValues.authInfo = authInfo;
                item.dataValues.basicInfo_desc = basicInfo_desc;
                item.dataValues.authInfo_desc = authInfo_desc;
                item.dataValues.registrationSource = "扫码关注";
            });
            //获取总页数相关操作
            let totalPages;
            let page = {
                pagination:{page:1,limit:10000}
            };
            let pages = yield Work.queryWorksAuth(page);
                totalPages = pages.length / +options.pagination.limit;
                totalPages = (totalPages > 1)
                    ? Math.ceil(+totalPages)//向上取整，有小数则+1
                    : 1;
            
            let retunrnWorks={
                    totalPages:totalPages,
                    data:works
            };
            return res.jsonp(retunrnWorks);
        }).catch(function (err) {
            return next(err);
        });
};
//查找已经完善了信息，但是没有提交认证的护工yzl########admin
const getBasicInfoWorksList = function (req, res, next) {
    let options = {
        pagination: req.pagination
    };
    
        co(function *() {
            let works = yield Work.queryWorksBasicInfo(options);
            
            works.forEach(function(item,index){
                let basicInfo = '1';
                let basicInfo_desc = '已完成';
                let authInfo  = '未完成';
                let authInfo_desc  = '0';
                item.dataValues.basicInfo = basicInfo;
                item.dataValues.authInfo = authInfo;
                item.dataValues.basicInfo_desc = basicInfo_desc;
                item.dataValues.authInfo_desc = authInfo_desc;
                item.dataValues.registrationSource = "扫码关注";
            });
            //获取总页数相关操作
            let totalPages;
            let page = {
                pagination:{page:1,limit:10000}
            };
            let pages = yield Work.queryWorksBasicInfo(page);
                totalPages = pages.length / +options.pagination.limit;
                totalPages = (totalPages > 1)
                    ? Math.ceil(+totalPages)//向上取整，有小数则+1
                    : 1;
            
            let retunrnWorks={
                    totalPages:totalPages,
                    data:works
            };
            return res.jsonp(retunrnWorks);
        }).catch(function (err) {
            return next(err);
        });
};
//查找未通过审核的护工列表yzl########admin
const getDisapproveWorksList = function (req, res, next) {
    let options = {
        pagination: req.pagination
    };
        co(function *() {
            let works = yield Work.queryWorksDisapprove(options);
               
            works.forEach(function(item,index){
                let obj = item.dataValues;
                //判断基本信息是否完善
                if(obj.name===null||obj.gender===null||obj.idCardNum===null
                    ||obj.phoneNum===null||obj.birthday===null||obj.level===null
                    ||obj.prov===null||obj.city===null||obj.exp===null
                    ||obj.avatar===null||obj.description===null){
                        let basicInfo = '0';
                        let basicInfo_desc = '未完成';
                        item.dataValues.basicInfo = basicInfo;
                        item.dataValues.basicInfo_desc = basicInfo_desc;
                    }else{
                        let basicInfo = '1';
                        let basicInfo_desc = '已完成';
                        item.dataValues.basicInfo = basicInfo;
                        item.dataValues.basicInfo_desc = basicInfo_desc;
                    };
                //判断认证信息是否完善
                if(obj.idCardFrontPic===null||obj.idCardBackPic===null
                    ||obj.healthCardPic===null){
                        let authInfo  = '未完成';
                        let authInfo_desc  = '0';
                        item.dataValues.authInfo = authInfo;  
                        item.dataValues.authInfo_desc = authInfo_desc;
                    }else{
                        let authInfo  = '已完成';
                        let authInfo_desc  = '1';
                        item.dataValues.authInfo = authInfo;  
                        item.dataValues.authInfo_desc = authInfo_desc;
                    };                   
                    obj.registrationSource = "扫码关注";
            });
            //获取总页数相关操作
            let totalPages;
            let page = {
                pagination:{page:1,limit:10000}
            };
            let pages = yield Work.queryWorksDisapprove(page);
                totalPages = pages.length / +options.pagination.limit;
                totalPages = (totalPages > 1)
                    ? Math.ceil(+totalPages)//向上取整，有小数则+1
                    : 1;
            
            let retunrnWorks={
                    totalPages:totalPages,
                    data:works
            };
            return res.jsonp(retunrnWorks);
        }).catch(function (err) {
            return next(err);
        });
};
//管理员查找所有护工信息yzl########admin
let getAllWorks = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    //let userId = queryUtils.parseQueryStrings(req.body.userId);
    //let ids = queryUtils.parseQueryStrings(req.body.id);
    let names = queryUtils.parseQueryStrings(req.body.name);
    let phoneNums = queryUtils.parseQueryStrings(req.body.phoneNum);
    let wechatNames = queryUtils.parseQueryStrings(req.body.wechatName);
    // let startDate = queryUtils.parseQueryStrings(req.body.startDate);
    // let endDate = queryUtils.parseQueryStrings(req.body.endDate);
    let idCardNums = queryUtils.parseQueryStrings(req.body.idCardNum);
    let stars = queryUtils.parseQueryStrings(req.body.star);
    if(stars[0]==='0'){
        stars = [];
    };
    let gender = queryUtils.parseQueryStrings(req.body.gender);
    if(gender[0]==='0'){
        gender = [];
    }else if(gender[0]==='1'){
        gender[0] = ['male'];
    }else if(gender[0]==='2'){
        gender[0] = ['female'];
    };
    let workType = queryUtils.parseQueryStrings(req.body.workType);
    if(workType[0]==='0'){
        workType = [];
    }else if(workType[0]==='1'){
        workType[0] = ['formal'];
    }else if(workType[0]==='2'){
        workType[0] = ['informal'];
    };
    let hospitalId = queryUtils.parseQueryIds(req.body.hospitalId);
    if(hospitalId[0]===0){
        hospitalId = [];
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
    //护工状态（接单中active，休息中inactive，有订单正在进行中progressing）
    //Service.STATUS_ACTIVE Service.STATUS_INACTIVE
    //Order.STATUS_PROGRESSING
    let workStatus = queryUtils.parseQueryStrings(req.body.workStatus);
    if(workStatus[0]==='0'){
        workStatus = [];
    }else if(workStatus[0]==='1'){
        workStatus[0] = [Service.STATUS_ACTIVE];
    }else if(workStatus[0]==='2'){
        workStatus[0] = [Service.STATUS_INACTIVE];
    };
    //status=0 -》所有护工 status=1 -》审核通过护工 status=2 -》待审核护工 
    let status = req.body.status;
    if(status==='0'){
        status = [];
    }else if(status==='1'){
        status = Work.STATUS_APPROVED;
    }else if(status==='2'){
        status = Work.STATUS_CHECKING;
    };
    
    let options = {
        query: {},
        pagination: req.pagination
    };
    //options.query.userIds = userIds;
    //options.query.ids = ids;
    options.query.names = names;//模糊查询
    options.query.phoneNums = phoneNums;//模糊查询
    options.query.wechatNames = wechatNames;//模糊查询
    options.query.idCardNums = idCardNums;//模糊查询
    options.query.stars = stars;
    options.query.gender = gender;
    options.query.workType = workType;
    options.query.hospitalId = hospitalId;
    options.query.state = state;
    options.query.city = city;
    options.query.workStatus = workStatus;

    co(function *() {
        let works = yield Work.queryAllWorks(options,status);
        
        //护工ID
        let worksId = [];
        //护工历史订单
        let workOrdersHistory = [];
        //护工已收到付款
        let workOrdersAmount = [];

        //获取所有workId
        works.forEach(function(item,index){
            let work = item.dataValues;
            let workId = work.id;
            worksId.push(workId);
        });

        //通过遍历workId取得历史订单和订单金额
        for(let i = 0;i < worksId.length;i++){
            //获取userId=i的所有已完成订单
            let order = yield Order.queryWorkAllCompletedOrder(worksId[i]);
            //获取userId=i的所有已支付订单
            let orderPrice = yield Order.queryWorkAllpaidOrder(worksId[i]);
           
            //将已完成订单存入order
            if(order.length>0){
                var workId = order[0].workId;
                var temp ={
                    workId:workId,
                    orderQuantity:order.length,
                    order:[]
                };
                temp.order.push(order);
                workOrdersHistory.push(temp);
            };
            //将已支付订单存入orderPrice
            if(orderPrice.length>0){
                var workId = orderPrice[0].workId;
                let amount = 0;
                for(let j = 0;j < orderPrice.length;j++){
                    amount += +orderPrice[j].amount;
                }
                var temp2 ={
                    workId:workId,
                    orderAmount:amount,
                    orderPrice:[]
                };
                temp2.orderPrice.push(orderPrice);
                workOrdersAmount.push(temp2);
            };
        };
        //将历史订单信息放入works中
    for(let j = 0 ; j<workOrdersHistory.length;j++){
        for(let i = 0 ;i < works.length ;i++){
            let workId = works[i].id;
            if(workId === workOrdersHistory[j].workId){
                works[i].dataValues.orderQuantity = workOrdersHistory[j].orderQuantity;
            };
        };
    };
    //将已付款信息放入users中
    for(let k = 0; k < workOrdersAmount.length;k++){
        for(let i = 0 ;i < works.length ;i++){
            let workId = works[i].id;
            if(workId === workOrdersAmount[k].workId){
                works[i].dataValues.orderAmount = workOrdersAmount[k].orderAmount;
            };
        };
    };
    //如果有的用户没有历史订单信息和已付款信息，那么将两值设为0、接单设置信息
         works.forEach(function(item,index){
            let work = item.dataValues;
            if(!work.orderQuantity){
                work.orderQuantity = 0;
            };
            if(!work.orderAmount){
                work.orderAmount = 0;
            };
            if(!work.orderComplain){
                work.orderComplain = 0;
            };
            // if(!work.services){
            //     work.workStatus = 0;
            //     work.worStatus_desc = '休息中';
            // };
            // if(work.services.length!==0&&work.services[0].status==='active'){
            //     work.workStatus = 1;
            //     work.worStatus_desc = '服务中';
            // }else{
            //     work.workStatus = 0;
            //     work.worStatus_desc = '休息中';
            // };
            
        });
        //获取总页数
        let totalPages;
        //没有参数时的分页情况，查询所有数据进行总页数的添加
        if(names.length===0&&phoneNums.length===0&&wechatNames.length===0&&
            idCardNums.length===0&&stars.length===0&&gender.length===0&&
            workType.length===0&&hospitalId.length===0&&state.length===0
            &&city.length===0&&workStatus.length===0){
            let page = {
                query: {},
                pagination:{page:1,limit:10000}
            };
            let pages = yield Work.queryAllWorks(page,status);
            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;
        };
        //有参数时的分页情况，查询该参数的所有数据进行总页数的添加
        if(names.length!==0||phoneNums.length!==0||wechatNames.length!==0||
            idCardNums.length!==0||stars.length!==0||gender.length!==0||
            workType.length!==0||hospitalId.length!==0||state.length!==0
            ||city.length!==0||workStatus.length!==0){
            let page = {
                query: {},
                pagination:{page:1,limit:10000}
            };
            page.query.names = names;//模糊查询
            page.query.phoneNums = phoneNums;//模糊查询
            page.query.wechatNames = wechatNames;//模糊查询
            page.query.idCardNums = idCardNums;//模糊查询
            page.query.stars = stars;
            page.query.gender = gender;
            page.query.workType = workType;
            page.query.hospitalId = hospitalId;
            page.query.state = state;
            page.query.city = city;
            page.query.workStatus = workStatus;
            let pages = yield Work.queryAllWorks(page,status);

            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;
        }
        let returnWorks={
                totalPages:totalPages,
                workNum:works.length,
                data:works
        };
        return res.jsonp(returnWorks);
    }).catch(function (err) {
        return next(err);
    });
};

// exports.getWorks = [checkPermission(Permissions.ADMIN_WORKS_LIST), getWorks];
// exports.getWorksAvailable = [checkPermission(Permissions.ADMIN_WORKS_LIST), getWorksAvailable];

// exports.deleteWorksId = [checkPermission(Permissions.ADMIN_WORKS_DELETE), findWork, deleteWorksId];
// exports.postWorks = [checkPermission(Permissions.ADMIN_WORKS_CREATE), postWorks];

//##护工查找
//通过Id查找护工信息
exports.getWorksId = [checkPermission(Permissions.ADMIN_WORKS_READ), findWork, getWorksId];
//管理员查找所有护工信息（根据status传值不同，查找不同的状态的护工）
exports.getAllWorks = [checkPermission(Permissions.ADMIN_WORKS_LIST), getAllWorks];
//管理员查找所有已回收的护工信息
exports.getWorksDeleted = [checkPermission(Permissions.ADMIN_WORKS_LIST), getWorksDeleted];

//########护工回收
//管理员回收护工（删除护工）
exports.deleteWorksId = [checkPermission(Permissions.ADMIN_WORKS_DELETE), findWork, deleteWorksId];
//管理员恢复回收护工(恢复护工)
exports.restoreWorksId = [checkPermission(Permissions.ADMIN_WORKS_UPDATE), findWorkIncludeDeleted, restoreWorksId];

//########护工修改
//管理员更改护工信息
exports.patchWorksId = [checkPermission(Permissions.ADMIN_WORKS_READ, Permissions.ADMIN_WORKS_UPDATE), findWork, patchWorksId];

//########护工审核
//查找待认证护工(基本信息和认证信息都完成)列表
exports.getCheckingWorksList = [checkPermission(Permissions.ADMIN_WORKS_LIST), getCheckingWorksList];
//查找已经完善了信息，但是没有提交认证的护工列表
exports.getBasicInfoWorksList = [checkPermission(Permissions.ADMIN_WORKS_LIST), getBasicInfoWorksList];
//查找未通过审核的护工列表
exports.getDisapproveWorksList = [checkPermission(Permissions.ADMIN_WORKS_LIST), getDisapproveWorksList];
//通过审核
exports.approveWorksId = [checkPermission(Permissions.ADMIN_WORKS_REVIEW, Permissions.ADMIN_REVIEW_LOGS_LIST), findWork, approveWorksId];
//不通过审核
exports.disapproveWorksId = [checkPermission(Permissions.ADMIN_WORKS_REVIEW, Permissions.ADMIN_REVIEW_LOGS_LIST), findWork, disapproveWorksId];



// exports.getPaymentMethod = [checkPermission(Permissions.ADMIN_WORKS_UPDATE), findWork, checkWork, getPaymentMethod];
// exports.deletePaymentMethod = [checkPermission(Permissions.ADMIN_WORKS_UPDATE), findWork, checkWork, deletePaymentMethod];
// exports.putPaymentMethod = [checkPermission(Permissions.ADMIN_WORKS_UPDATE), findWork, checkWork, putPaymentMethod];

// exports.getService = [checkPermission(Permissions.ADMIN_WORKS_UPDATE), findWork, checkWork, getService];
// exports.putService = [checkPermission(Permissions.ADMIN_WORKS_UPDATE), findWork, checkWork, putService];
// exports.patchService = [checkPermission(Permissions.ADMIN_WORKS_UPDATE), findWork, checkWork, patchService];

// exports.patchPrices = [checkPermission(Permissions.ADMIN_WORKS_UPDATE), findWork, checkWork, patchPrices];
// exports.patchBulkPrices = [checkPermission(Permissions.ADMIN_WORKS_UPDATE), patchBulkPrices];

// exports.patchWorksId = [checkPermission(Permissions.ADMIN_WORKS_READ, Permissions.ADMIN_WORKS_UPDATE), findWork, patchWorksId];
// exports.putWorksIdChange = [checkPermission(Permissions.ADMIN_WORKS_READ, Permissions.ADMIN_WORKS_DELETE, Permissions.ADMIN_SUPERVISIONS_CREATE), findWork, putWorksIdChange];
// exports.patchAvatar = [checkPermission(Permissions.ADMIN_USERS_UPDATE, Permissions.ADMIN_WORKS_READ), findWork, patchAvatar];

// exports.putWorkPunishment = [checkPermission(Permissions.ADMIN_WORKS_UPDATE), findWork, putWorkPunishment];
// exports.putWorkPunishmentCancel = [checkPermission(Permissions.ADMIN_WORKS_UPDATE), findWork, putWorkPunishmentCancel];