"use strict";
const co = require('co');
const _ = require('lodash');
const errors = require('../../errors');
const Work = require('../../models').work;
const User = require('../../models').user;
const Order = require('../../models').order;
//const formidable = require('formidable');
var path = require("path");

var Model = require('../../models');
var sequelize = Model.sequelize;
var Service = Model.service;
var Price = Model.price;
var Hospital = Model.hospital;
//var UserBlockedWork = Model.userBlockedWork;
var OrderWork = Model.orderWork;
var OrderStatus = Model.orderStatus;
//var Punishment = Model.punishment;
var moment = require('moment');
//var redisClient = require('../lib/redisClient').client;
//var redis = require('../lib/redisClient').redis;
var maxOrderCount = require('../../config/config.js')['business']['maxOrderCount'];

//###############################################################################
//找到护工
const findWork = function (req, res, next) {
    let workId = req.params.workId;
    // let workId = req.params.workId;
    // let userId = req.user.id;
    co(function*() {
        let work = yield Work.queryById(workId);
        // if (!work || work.userId !== userId) {
        //     let error = errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND);
        //     return next(error);
        // }
        req.work = work;
        return next();
    }).catch(function (err) {
        return next(err);
    });
};
//判断是否认证过了
const checkWorkApproved = function (req, res, next) {
    if (req.work.status !== Work.STATUS_APPROVED) {
        let error = errors.newError(errors.types.TYPE_API_WORK_NOT_APPROVED);
        return next(error);
    }
    next();
};
//###############################################################################

//按照特定ID来查询护工
const getWorkById = function(req, res, next) {
    let workId = req.params.workId;
    //res.send('respond:'+userId);
    

    Work.queryById(workId).then(function (work) {
        if (work === null) {
            res.jsonp({});
        } else {
            res.jsonp(work);
        }
    });
};
// 通过护工ID查看护工服务历史
const getWorkHistory = function(req, res, next) {
    let workId = req.query.workId;

    Order.GetWorkAllCompletedOrder(workId).then(function(history){
        res.jsonp(history);
    })
}
//按照POST条件来给出护工列表
const listWorks = function(req, res, next) {
    let options = {}    //定义查询选项
    options.where = {}  //定义查询where条件
    options.pagination = {} // 初始化分页信息

    if (req.body.gender) {
        options.where.gender = req.body.gender.split(',');
    }

    if (req.body.level) {
        options.where.level = parseInt(req.body.level);
    }

    if (req.body.star) {
        options.where.star = parseInt(req.body.star);
    }

    if (req.body.page) {
        options.pagination.page = parseInt(req.body.page);
    } else {
        options.pagination.page = 1;    // 默认第一页    
    }

    if (req.body.limit) {
        options.pagination.limit = parseInt(req.body.limit);
    } else {
        options.pagination.limit = 5;   // 默认一页显示5行
    }
    
    console.log(options);

    Work.queryAll(options).then(function(works){

        console.log(works);
        // let genderTab = {'male':'男', 'female':'女'};

        // works.forEach(function(elem, index){
        //     elem.dataValues.gender = genderTab[elem.dataValues.gender];
        // })
        

        res.jsonp(works);
    }).catch(function(e){
        let error = errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND);
        return next(error);
    })

}
//按照POST条件查找出可用护工列表yzl###############
const postAvailableWorks = function(req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    let hospitalId = req.body.hospitalId;
    let patientGender = queryUtils.parseQueryStrings(req.body.patientGender);
    if(!patientGender||patientGender.length===0){
        patientGender = ['male','female'];
    };
    let workGender = queryUtils.parseQueryStrings(req.body.workGender);
    if(!workGender||workGender.length===0){
        workGender = ['male','female'];
    };
    let nursingTime =queryUtils.parseQueryStrings(req.body.nursingTime); 
    if(!nursingTime||nursingTime.length===0){
        nursingTime = ['day'];
    };
    let dependentLevel = queryUtils.parseQueryStrings(req.body.dependentLevel);
    if(!dependentLevel||dependentLevel.length===0){
        dependentLevel = ['level1'];
    };
    let star = queryUtils.parseQueryStrings(req.body.star);
    if(!star||star.length===0){
        star = ['3'];
    };
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;
    //分页参数
    let options = {
        pagination: req.pagination
    };
    //分页参数
    let limit = options.pagination.limit;
    let offset = (options.pagination.page - 1) * limit;

    co(function *() {
        // 找到对应医院
        var hospital = yield Hospital.queryById(hospitalId);
        if (!hospital) {
            console.log("Can not find hospital hospitalId=" + hospitalId);
        }
        //通过医院来确定护工位置
        var state = hospital.state;
        var city = hospital.city;
        //进行护工查找(护工性别，是否通过审核，星级)
        //(护工接单：开启接单，病人性别，服务时间，服务等级，所在区域)
        //找出的护工没有经过order和orderwork的筛选，在下面进行第二步筛选
        
        var workers = yield Work.findAll({
            limit:limit,
            offset: offset,
            where: {
                // id: {
                //     // 不分配给用户不喜欢的护工
                //     $notIn: userBlockedIds
                // },
                gender:{
                    in : workGender
                },
                // userId: {
                //     // 不能分配自己给自己
                //     $ne: conditions.customerId
                // },
                status: {
                    // 审核通过
                    $eq: Work.STATUS_APPROVED
                },
                star:{
                    $eq:star //是否要改成大于该星级都可以显示
                }
                // priceId: {
                //     // 必须设置过价格
                //     $ne: null
                // }
                
            },
            include: [
                {
                    model: Service,
                    //include: [Hospital],
                    where: {
                        status: Service.STATUS_ACTIVE,//需要更改
                        patientGender: {
                            in:patientGender
                        },
                        nursingTime: {
                            in:nursingTime
                        },
                        dependentLevel: {
                            in:dependentLevel
                        },
                        state: state,
                        city: city
                    }
                },
                // {
                //     model: Price
                // },
                {
                    model: OrderWork
                },
                {
                    model: Order,
                    // where: {
                    //     status: {
                    //         $notIn: [Order.STATUS_SIGNED, Order.STATUS_UNPAID]
                    //     }
                    // }
                }
                // {
                //     model: Punishment
                // }
            ]
            //limit: 1 提高效率用，用于指派新护工
        });

    //第二步筛选，通过遍历护工订单和orderwork信息来筛选护工，
    //1.如果订单中有singed状态的订单则护工不能接单，如果
    //2.比较时间，在未付款、付款、正在进行中的订单，只要有一个护工这三类订单的结束日期小于当前
         //订单开始日期，即不能接单（锁定）
    //3.护工有订单未响应则也不能接单（锁定）
        let noPermissinWorkerIds = [];
        for (var i = 0; i < workers.length; i++) {
            var order = workers[i].dataValues.orders;
            var orderWork = workers[i].dataValues.orderWorks;

            for(var j = 0; j < order.length; j++){
                let obj = order[j];
                if(obj.status===Order.STATUS_SIGNED){
                    noPermissinWorkerIds.push(workers[i].id);
                };
                //比较时间，在未付款、付款、正在进行中的订单
                if(obj.status===Order.STATUS_PROGRESSING||obj.status===Order.STATUS_PAID
                    ||obj.status===Order.STATUS_UNPAID){
                obj.dataValues.endDate = moment(obj.dataValues.endDate).utcOffset(+8).format('YYYY-MM-DD');
                var orderEndDate=new Date(obj.dataValues.endDate);
                if(startDate){
                    var queryStartDate=new Date(startDate);
                }else{
                    var queryStartDate=new Date('2050-1-1');
                };
        
                let orderEndDateLong = Date.parse(orderEndDate);
                let queryStartDateLong = Date.parse(queryStartDate);
                //比较时间，只要有一个护工在这三类订单中的结束日期小于当前订单开始日期，即不能接单（锁定）
                if(queryStartDateLong < orderEndDateLong){
                    noPermissinWorkerIds.push(workers[i].id);//数组中放置不能接单的护工
                }
                };
            };
            //护工有订单未响应则也不能接单（锁定）
            for(var k = 0 ;k<orderWork.length;k++){
                let obj = orderWork[k];
                if(obj.status==='idle'){
                    noPermissinWorkerIds.push(workers[i].id);
                };
            };
        };

        //给不能接单的护工ids去重
        let unique = require('../../utils/uniqueUtil');
         noPermissinWorkerIds = unique(noPermissinWorkerIds);

         //从原来没有经过order和orderwork筛选的护工中去掉不能接单的，得到最后的护工列表
         //使用逆向循环实现如果想判定两个数组中是否有相同元素，使用正向循环会因为index次序改变而错误
        for(var i = workers.length-1;i>=0;i--){
            let workId = workers[i].id;
            for(var j = 0 ;j<noPermissinWorkerIds.length;j++){
                if(workId===noPermissinWorkerIds[j]){
                    workers.splice(i,1);
                };
            };
        };
        //返回护工列表
        res.jsonp(workers);
        // var results = [];
        // for (var i = 0; i < workerResults.length; ++i) {
        //     var worker = workerResults[i].toJSON();
        //     let orderCount = 0;
        //     var orders = yield Order.findAll({
        //         where: {
        //             workId: worker.work_id,
        //             status: {
        //                 in: [Order.STATUS_SIGNED, Order.STATUS_UNPAID]
        //             }
        //         }
        //     });
        //     var ordersProgressing = yield Order.findAll({
        //         where: {
        //             workId: worker.work_id,
        //             status: {
        //                 in: [Order.STATUS_PROGRESSING]
        //             }
        //         }
        //     });
        // //比较时间，只要有一个用户正在进行中订单的结束日期小于当前订单开始日期，即不能接单（锁定）
        //     var list = [];//只要list有值，就不能接单
        //    for(var i = 0 ;i < ordersProgressing.length;i++){
        //     var obj = ordersProgressing[i].dataValues;
        //     //obj.startDate = moment(obj.startDate).utcOffset(+0).format('YYYY-MM-DD');
        //     obj.endDate = moment(obj.endDate).utcOffset(+0).format('YYYY-MM-DD');
        //         var orderEndDate=new Date(obj.endDate);
        //         if(startDate.length>0){
        //             var queryStartDate=new Date(startDate);
        //         }else{
        //             var queryStartDate=new Date('2050-1-1');
        //         };
        
        //         let orderEndDateLong = Date.parse(orderEndDate);
        //         let queryStartDateLong = Date.parse(queryStartDate);
        //         //比较时间，只要有一个用户正在进行中订单的结束日期小于当前订单开始日期，即不能接单（锁定）
        //         if(queryStartDateLong < orderEndDateLong){
        //             list.push(obj);//只要list有值，就不能接单
        //         }
        // };
        //     if (!orders || orders.length <= 0 && list.length === 0) {
        //         //
        //         var orderWorks = yield OrderWork.findAll({
        //             where: {
        //                 workId: worker.work_id,
        //                 status: OrderWork.STATUS_IDLE
        //             },
        //             order: [
        //                 ['utime', 'DESC']
        //             ],
        //             limit: maxOrderCount
        //         });

        //         var orderIds = [].concat(_.map(orderWorks, function (orderwork) {
        //             return orderwork.orderId;
        //         }));

        //         if (!orderIds || orderIds.length <= 0) {
        //             orders = yield Order.findAll({
        //                 where: {
        //                     workId: worker.work_id,
        //                     status: Order.STATUS_COMPLETED
        //                 },
        //                 order: [
        //                     ['actualEndDate', 'DESC']
        //                 ],
        //                 limit: maxOrderCount
        //             });
        //             orderCount = 0;
        //         } else {
        //             orders = yield Order.findAll({
        //                 where: {
        //                     id: {
        //                         in: orderIds
        //                     }
        //                 },
        //                 order: [
        //                     ['actualEndDate', 'DESC']
        //                 ]
        //             });
        //             orderCount = orders.length;
        //         }
        //     } else {
        //         orderCount = orders.length;
        //     }

        //     worker.orders = _.map(orders, function (order) {
        //         return order.toJSON();
        //     });
        //     worker.orderCount = orderCount;
        //     results.push(worker);
        // };
    }).catch(function(e){
            let error = errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND);
            return next(error);
        });
    // let options = {}    //定义查询选项
    // options.where = {}  //定义查询where条件
    // options.pagination = {} // 初始化分页信息
    // if (req.body.gender) {
    //     options.where.gender = req.body.gender.split(',');
    // }
    // if (req.body.level) {
    //     options.where.level = parseInt(req.body.level);
    // }
    // if (req.body.star) {
    //     options.where.star = parseInt(req.body.star);
    // }
    // if (req.body.page) {
    //     options.pagination.page = parseInt(req.body.page);
    // } else {
    //     options.pagination.page = 1;    // 默认第一页    
    // }
    // if (req.body.limit) {
    //     options.pagination.limit = parseInt(req.body.limit);
    // } else {
    //     options.pagination.limit = 5;   // 默认一页显示5行
    // }
    // console.log(options);
    // Work.queryAll(options).then(function(works){
    //     console.log(works);
    //     // let genderTab = {'male':'男', 'female':'女'};
    //     // works.forEach(function(elem, index){
    //     //     elem.dataValues.gender = genderTab[elem.dataValues.gender];
    //     // })
    //     res.jsonp(works);
    // }).catch(function(e){
    //     let error = errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND);
    //     return next(error);
    // })
}

//通过POST添加新护工的信息yzl################
const postAddWork = function(req, res, next) {
    let userId = req.body.userId;//有问题，应该从登录信息中获取userId
    let name = req.body.name;//前端必须传值过来
    let idCardNum = req.body.idCardNum;//前端必须传值过来
    let gender = req.body.gender;//前端必须传值过来，需要在前端设置数据完整性校验
    let description = req.body.description;
    let phoneNum = req.body.phoneNum;
    let birthday = req.body.birthday;
    let level = req.body.level;
    //let star = req.body.star;
    let prov = req.body.prov;
    let city = req.body.city;
    let exp = req.body.exp;
    //通过level判定priceId的模板
    let priceId ;
    if(level==='1'){
        priceId = 1;
    }else if(level==='2'){
        priceId = 2;
    }else if(level==='3'){
        priceId = 3;
    };
    let avatarPath;
    //let userId = req.user.id;//目前无法添加，能够获取登录信息后续需要更改

    if(req.file){
        //截取能访问的静态页资源path
         avatarPath='http://localhost:8080'+(req.file.path).substr(6);
    };
    //通过身份证计算护工年龄
    let idCardAge = require('../../utils/idCardAgeUtils');
    let age = idCardAge(idCardNum);

    let values = {
        status: Work.STATUS_CHECKING,
        priceId: priceId,
        idCardNum:idCardNum,
        age:age,
        level:level,
        star:1,//默认设置为一星护工
        prov:prov,
        city:city,
        userId:userId 
    };
    if(name){
        values.name = name
    }
    if(phoneNum){
        values.phoneNum = phoneNum
    }
    if(gender){
        values.gender = gender
    }
    if(birthday){
        values.birthday = birthday
    }
    if(exp){
        values.exp = exp
    }
    if(description){
        values.description = description
    }
    if(avatarPath){
        values.avatar = avatarPath
    }
//在work表中新建一条护工数据
    co(function*() {
        let work = yield Work.create(values);
        return res.jsonp(work);
    }).catch(function (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            err = errors.newError(errors.types.TYPE_API_WORK_CONFLICT);
        }
        return next(err);
    });
}

//通过post修改某个护工的信息yzl################
const postUpdateWork = function(req, res, next) {
    let id = req.body.workId;
    let name = req.body.name;
    let phoneNum = req.body.phoneNum;
    let gender = req.body.gender;
    let birthday = req.body.birthday;
    let exp = req.body.exp;
    let description = req.body.description;
    let level = req.body.level;
    let prov = req.body.prov;
    let city = req.body.city;
    //通过level判定priceId的模板
    let priceId ;
    if(level==='1'){
        priceId = 1;
    }else if(level==='2'){
        priceId = 2;
    }else if(level==='3'){
        priceId = 3;
    };
    let avatarPath;
    if(req.file){
        //截取能访问的静态页资源path
         avatarPath='http://localhost:8080'+(req.file.path).substr(6);
    };
    //var form = new formidable.IncomingForm();
   // form.encoding = 'utf-8';
    // form.uploadDir = path.join(__dirname + "/../../image/upload");
    // form.keepExtensions = true;//保留后缀
    // form.maxFieldsSize = 2 * 1024 * 1024;

    let values = {};
    if(name){
        values.name = name
    };
    if(phoneNum){
        values.phoneNum = phoneNum
    };
    if(gender){
        values.gender = gender
    };
    if(birthday){
        values.birthday = birthday
    };
    if(exp){
        values.exp = exp
    };
    if(description){
        values.description = description
    };
    if(level){
        values.level = level
    };
    if(prov){
        values.prov = prov
    };
    if(city){
        values.city = city
    };
    if(priceId){
        values.priceId = priceId
    };
    if(avatarPath){
        values.avatar = avatarPath
    };

    co(function *() {
    let data = yield Work.updateWorkById(id, values);
        console.log(data);
        if (data[0] > 0) {
            res.jsonp({status:0, message:'护工信息更新成功', workId:id});
        } else {
            let error = errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND);
            return next(error);
        }     
}).catch(function (err) {
    return next(err);
});
}
//通过post提交某个护工认证申请yzl################
const postAuthWork = function(req, res, next) {
    let id = req.body.workId;
    let idCardNum = req.body.idCardNum;
    let idCardFrontPath;
    let idCardBackPath;
    let healthCardPath;
    if(req.files){
        //截取能访问的静态页资源path
        idCardFrontPath='http://localhost:8080'+(req.files[0].path).substr(6);
        idCardBackPath='http://localhost:8080'+(req.files[1].path).substr(6);
        healthCardPath='http://localhost:8080'+(req.files[2].path).substr(6);
    };
    let values = {};
    if(idCardNum){
        values.idCardNum = idCardNum
    }
    if(idCardFrontPath){
        values.idCardFrontPic = idCardFrontPath
    }
    if(idCardBackPath){
        values.idCardBackPic = idCardBackPath
    }
    if(healthCardPath){
        values.healthCardPic = healthCardPath
    }
    co(function *() {
        //检查护工当前是否认证
    let workStatus = yield Work.queryAuthById(id);
    if(workStatus.status===Work.STATUS_APPROVED){
        res.jsonp({status:0,msg:'护工已经认证过，无需再次认证',work_Id:id});
    }else{
        //检查身份证信息是否一致
        let idCard = yield Work.queryIdCardById(id);
        if(idCard.idCardNum!==values.idCardNum){
        res.jsonp({status:0,msg:'身份证信息与注册时不一致',work_Id:id});
        }else{
        //更新护工信息，提交认证图片
        let data = yield Work.updateAuthWorkById(id, values);
        console.log(data);
        if (data[0] > 0) {
            res.jsonp({status:1, msg:'提交成功，请等待认证',work_Id:id});
        } else {
            let error = errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND);
            return next(error);
        }
    }  
    }
}).catch(function (err) {
    return next(err);
});
};

//通过GET判断护工是否通过了认证yzl################
const getisAuthWork = function(req, res, next) {
    //let id = req.query.workId;
    let work = req.work;
    co(function *() {
        //检查护工当前是否认证
    let workStatus = yield Work.queryAuthById(work.id);
    let approved_status;
    if(workStatus.status==='approved'){
        approved_status=1;
    }else{
        approved_status=0;
    };
    if(workStatus){
        res.jsonp({work_Id:work.id,workStatus:workStatus.status,approved_status:approved_status});
    };
}).catch(function (err) {
    return next(err);
});
};

//判断当前用户是不是护工yzl################
const getisWork = function (req, res, next) {
    let userId = req.params.userId;
    co(function*() {
    //检查当前用户是不是护工
    let workStatus = yield Work.queryWorkByUserId(userId);
        if (!workStatus) {
            res.jsonp({user_Id:userId,msg:'该用户还不是护工',workStatus:'0'});
        }else{
            req.work = workStatus;
            return next();
        };
        
    }).catch(function (err) {
        return next(err);
    });
};
//判断当前用户是不是护工yzl################
// const getisWork = function(req, res, next) {
//     let userId = req.params.userId;
//     co(function *() {
//         //检查护工当前是否认证
//     let workStatus = yield Work.queryWorkByUserId(userId);
//     if(workStatus){
//         res.jsonp({work_Id:workStatus.id,msg:'该用户已经是护工',workStatus:'1'});
//     }else{
//         res.jsonp({user_Id:userId,msg:'该用户不是护工',workStatus:'0'});
//     };
// }).catch(function (err) {
//     return next(err);
// });
// };

//通过GET判断护工是否完善了个人信息yzl################
const getisBasicInfoWork= function(req, res, next) {
    //let id = req.query.workId;
    let work = req.work;
    co(function *() {
        //检查护工当前是否完善了基本信息
    //let work= yield Work.queryById(id);
    if(work){
    let obj = work.dataValues;
    if(obj.name===null||obj.gender===null||obj.idCardNum===null
        ||obj.phoneNum===null||obj.birthday===null||obj.level===null
        ||obj.prov===null||obj.prov===''||obj.city===null||obj.exp===null
        ||obj.priceId===null||obj.avatar===null||obj.description===null){
        res.jsonp({work_Id:work.id,basicInfo:'0',basicInfo_desc:'护工信息未完善'});
    }else{
        res.jsonp({work_Id:work.id,basicInfo:'1',basicInfo_desc:'护工信息已完善'});
    }
};
}).catch(function (err) {
    return next(err);
});
};

// 删除某个护工
const deleteWork = function(req, res, next) {
    let id = req.params.workId;

    Work.deleteWorkById(id).then(function(data){
        console.log(data);
        if (data === 1) {
            res.jsonp({status:1, message:'删除成功', data:data});
        } else {
            let error = errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND);
            return next(error);
        }
        
    }).catch(function(e){
        console.log(e);
        let error = errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND);
        return next(error);
    });
};
//护工查看接单开关状态yzl################
const getWorkStatus= function(req, res, next) {
    //let id = req.query.workId;
    let work = req.work;
    co(function *() {
        //检查护工当前是否完善了基本信息
    //let work= yield Work.queryById(id);
    if(work){
    let obj = work.dataValues;
    if(obj.workStatus==='active'){
        res.jsonp({work_Id:work.id,workStatus:obj.workStatus,workStatus_desc:'开启接单'});
    }else{
        res.jsonp({work_Id:work.id,workStatus:obj.workStatus,workStatus_desc:'关闭接单'});
    };
};
}).catch(function (err) {
    return next(err);
});
};
let getService = function (req, res, next) {
    let work = req.work;

    co(function*() {
        let service = work.formatService();
        if (service) {
            delete(service['nursingTime']);
            delete(service['patientGender']);
            return res.jsonp(service);
        } else {
            let error = errors.newError(errors.types.TYPE_API_WORK_SERVICE_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};
let patchService = function (req, res, next) {
    let work = req.work;
    let workId = work.id;
    let workStatus = req.body.workStatus;

    co(function*() {
        // yield Work.update({
        //     workStatus: workStatus
        // }, {
        //     where: {
        //         id: workId
        //     }
        // });
        work.workStatus = workStatus;
        yield work.save();
        // 更新护工队列
        //workerSchedule.updateQueue(work.id);
        //return res.status(204).end();
        yield work.reload();
        return res.jsonp({work_Id:workId,workStatus:work.workStatus})
    }).catch(function (err) {
        return next(err);
    });
};
let filterInvalidEnum = function (array, enums) {
    return _.filter(array, function (obj) {
        return _.indexOf(enums, obj) >= 0;
    });
};
let putService = function (req, res, next) {
    co(function*() {
        let queryUtils = require('../../utils/queryUtils');
        let state = req.body.state;
        let city = req.body.city;
        let region = req.body.region;
        //let status = req.body.status || Service.STATUS_ACTIVE;
        // let patientGenders = queryUtils.parseQueryStrings(req.body.patientGender);
        // let nursingTimes = queryUtils.parseQueryStrings(req.body.nursingTime);
        let dependentLevels = queryUtils.parseQueryStrings(req.body.dependentLevel);
        let hospitalIds = queryUtils.parseQueryStrings(req.body.hospitalIds);
        let work = req.work;
        // patientGenders = [].concat(patientGenders || []);
        // nursingTimes = [].concat(nursingTimes || []);
        dependentLevels = [].concat(dependentLevels || []);
        hospitalIds = [].concat(hospitalIds || []);

        // patientGenders = filterInvalidEnum(patientGenders, Service.GENDER);
        // nursingTimes = filterInvalidEnum(nursingTimes, Service.NURSING_TIME);
        dependentLevels = filterInvalidEnum(dependentLevels, Service.DEPENDENT_LEVEL);

        if (!dependentLevels.length) {
            let error = errors.newError(errors.types.TYPE_API_WORK_SERVICE_INVALID);
            return next(error);
        };
        // if (!patientGenders.length || !nursingTimes.length || !dependentLevels.length) {
        //     let error = errors.newError(errors.types.TYPE_API_WORK_SERVICE_INVALID);
        //     return next(error);
        // }
        if (!state) {
            let error = errors.newError(errors.types.TYPE_API_WORK_NULL_STATE);
            return next(error);
        }
        if (!city) {
            let error = errors.newError(errors.types.TYPE_API_WORK_NULL_CITY);
            return next(error);
        }
        if (!hospitalIds.length) {
            let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
            return next(error);
        }
        let hospitals = yield Hospital.queryByIds(hospitalIds);
        if (hospitals.length !== hospitalIds.length) {
            let error = errors.newError(errors.types.TYPE_API_WORK_NOT_SUPPORT_CITY);
            return next(error);
        }
        let services = [];
                dependentLevels.forEach(function (dependentLevel) {
                    hospitalIds.forEach(function (hospitalId) {
                        services.push({
                            //patientGender: patientGender,
                            //nursingTime: nursingTime,
                            dependentLevel: dependentLevel,
                            workId: work.id,
                            state: state,
                            city: city,
                            region: region,
                            //status: status,
                            hospitalId: hospitalId
                        });
                    });
                });
       
        // patientGenders.forEach(function (patientGender) {
        //     nursingTimes.forEach(function (nursingTime) {
        //         dependentLevels.forEach(function (dependentLevel) {
        //             hospitalIds.forEach(function (hospitalId) {
        //                 services.push({
        //                     patientGender: patientGender,
        //                     nursingTime: nursingTime,
        //                     dependentLevel: dependentLevel,
        //                     workId: work.id,
        //                     state: state,
        //                     city: city,
        //                     region: region,
        //                     //status: status,
        //                     hospitalId: hospitalId
        //                 });
        //             });
        //         });
        //     });
        // });
        yield Service.deleteAndCreate(work.id, services);
        // 更新护工队列
       // workerSchedule.updateQueue(work.id);
        return res.jsonp({
            work_Id:work.id,
            workStatus: work.workStatus,
            //patientGender: dependentLevels,
            //nursingTime: nursingTimes,
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
const getPaymentMethod = function (req, res, next) {
    let work = req.work;
    co(function*() {
        let paymentMethod = yield work.getPaymentMethod();
        if (paymentMethod) {
            return res.jsonp({work_Id:work.id,paymentMethod:paymentMethod});
        } else {
            let error = errors.newError(errors.types.TYPE_API_WORK_PAYMENT_METHOD_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};
const deletePaymentMethod = function (req, res, next) {
    const work = req.work;
    co(function*() {
        let paymentMethod = yield work.getPaymentMethod();
        if (paymentMethod) {
            yield work.setPaymentMethod(null);
            return res.jsonp({work_Id:work.id,paymentMethod:paymentMethod});
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
    let bank = req.body.bank;
    let address = req.body.address;
    let work = req.work;

    co(function*() {
        yield work.createPaymentMethod({
            name: name,
            cardNum: cardNum,
            bank:bank,
            address:address
        });
        let paymentMethod = yield work.getPaymentMethod();
        return res.jsonp({work_Id:work.id,paymentMethod:paymentMethod});
    }).catch(function (err) {
        return next(err);
    });
};


exports.getWorkById = getWorkById;
exports.getWorkHistory = getWorkHistory;
exports.listWorks = listWorks;

//查找可用护工//yzl
exports.postAvailableWorks=postAvailableWorks;
//护工基本信息完善（添加护工）//yzl
exports.postAddWork = postAddWork;
//护工基本信息更新//yzl
exports.postUpdateWork = postUpdateWork;
//护工认证//yzl
exports.postAuthWork = postAuthWork;

//护工接单设置###########
//护工查看接单开关状态yzl
exports.getWorkStatus=[getisWork,getWorkStatus];
//护工查看接单详细设置
exports.getService = [findWork, checkWorkApproved, getService];
//护工更改接单状态
exports.patchService = [findWork, checkWorkApproved, patchService];
//护工更改接单设置
exports.putService = [findWork, checkWorkApproved, putService];

//护工钱包设置############
exports.getPaymentMethod = [findWork, checkWorkApproved, getPaymentMethod];
exports.deletePaymentMethod = [findWork, checkWorkApproved, deletePaymentMethod];
exports.putPaymentMethod = [findWork, checkWorkApproved, putPaymentMethod];

//判断当前用户是不是护工//yzl
// exports.getisWork=getisWork;
//判断当前护工是否经过了认证//yzl
exports.getisAuthWork=[getisWork,getisAuthWork];
//判断当前护工是否完善了基本信息//yzl
exports.getisBasicInfoWork=[getisWork,getisBasicInfoWork];

exports.deleteWork = deleteWork;