"use strict";
const co = require('co');
const _ = require('lodash');
const User = require('../../models').user;
const Order = require('../../models').order;
//const Customer = require('../../business/customerHelper');
const errors = require('../../errors');
const Permissions = require('../../setup/adminPermissions');

//通过userId查找用户yzl######admin
const findUser = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    let userId = req.params.userId;
    let startDate = queryUtils.parseQueryStrings(req.body.startDate);
    let endDate = queryUtils.parseQueryStrings(req.body.endDate);
    co(function *() {
        let user =  yield User.queryById(userId);
        if (!user) {
            let error = errors.newError(errors.types.TYPE_API_USER_NOT_FOUND);
            return next(error);
        }

        let order = yield Order.queryUserAllCompletedOrder(user.dataValues.id,startDate,endDate);
        let orderPrice = yield Order.queryUserAllpaidOrder(user.dataValues.id,startDate,endDate);

        //声明变量记录order及order个数
        let ordersHistory = [];
        //声明变量记录orderPrice及已消费金额
        let ordersAmount = [];

         //将已完成订单存入order
         if(order.length>0){
            var temp ={
                orderQuantity:order.length,
                order:[]
            };
            temp.order.push(order);
            ordersHistory.push(temp);
        };

        //将已支付订单存入orderAmount
        if(orderPrice.length>0){
            let amount = 0;
            for(let j = 0;j < orderPrice.length;j++){
                amount += +orderPrice[j].amount;//统计已支付金额
            }
            var temp2 ={
                orderAmount:amount,
                orderPrice:[]
            };
            temp2.orderPrice.push(orderPrice);
            ordersAmount.push(temp2);
        }

        //为orderQuantity，orderAmount进行赋值
        if(ordersHistory.length!==0){
            user.dataValues.orderQuantity = ordersHistory[0].orderQuantity;
        }
        if(ordersAmount.length!==0){
            user.dataValues.orderAmount = ordersAmount[0].orderAmount;
        }

        //如果不存在orderQuantity，orderAmount，则赋值为0
        if(!user.dataValues.orderQuantity){
            user.dataValues.orderQuantity = 0;
        }
        if(!user.dataValues.orderAmount){
            user.dataValues.orderAmount = 0;
        }
        
        //重构数据类型，加上标识key值
        //可以使用[];
        //userData.push(user);
        let userData = {
            user:user,
            historyOrder:[],
            orderPrice:[]
        };
        userData.historyOrder.push(order);
        userData.orderPrice.push(orderPrice);
        req.targetUser = userData;
        next();
});
};

//查询后台所有用户信息yzl######admin
const getUsers = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    let userName = queryUtils.parseQueryStrings(req.body.userName);
    let phoneNum = queryUtils.parseQueryStrings(req.body.phoneNum);
    let wechatName = queryUtils.parseQueryStrings(req.body.wechatName);
    let startDate = queryUtils.parseQueryStrings(req.body.startDate);
    let endDate = queryUtils.parseQueryStrings(req.body.endDate);
    let state = queryUtils.parseQueryStrings(req.body.state);
    let city = queryUtils.parseQueryStrings(req.body.city);
    let region = queryUtils.parseQueryStrings(req.body.region);
    
    let options = {
        query: {},
        pagination:req.pagination
    };
    options.query.userName = userName;//模糊查询
    options.query.phoneNum = phoneNum;//模糊查询
    options.query.wechatName = wechatName;//模糊查询
    options.query.startDate = startDate;
    options.query.endDate = endDate;
    options.query.state = state;
    options.query.city = city;
    options.query.region = region;
    co(function *() {
        let users = yield User.queryAll(options);

        //用户ID
        let usersId = [];
        //用户历史订单
        let ordersHistory = [];
        //用户已付款订单
        let ordersAmount = [];

        //获取所有userId
        users.forEach(function(item,index){
            let user = item.dataValues;
            let userId = user.id;
            usersId.push(userId);
        });
        
        //通过遍历userId取得历史订单和订单金额
        for(let i = 0;i < usersId.length;i++){
            //获取userId=i的所有已完成订单
            let order = yield Order.queryUserAllCompletedOrder(usersId[i],startDate,endDate);
            //获取userId=i的所有已支付订单
            let orderPrice = yield Order.queryUserAllpaidOrder(usersId[i],startDate,endDate);
           
            //将已完成订单存入order
            if(order.length>0){
                var userId = order[0].customerId;
                var temp ={
                    userId:userId,
                    orderQuantity:order.length,
                    order:[]
                };
                temp.order.push(order);
                ordersHistory.push(temp);
            };
            //将已支付订单存入orderPrice
            if(orderPrice.length>0){
                var userId = orderPrice[0].customerId;
                let amount = 0;
                for(let j = 0;j < orderPrice.length;j++){
                    amount += +orderPrice[j].amount;
                }
                var temp2 ={
                    userId:userId,
                    orderAmount:amount,
                    orderPrice:[]
                };
                temp2.orderPrice.push(orderPrice);
                ordersAmount.push(temp2);
            };
        };
    //将历史订单信息放入users中
    for(let j = 0 ; j<ordersHistory.length;j++){
        for(let i = 0 ;i < users.length ;i++){
            let userId = users[i].id;
            if(userId === ordersHistory[j].userId){
                users[i].dataValues.orderQuantity = ordersHistory[j].orderQuantity;
            };
        };
    };
    //将已付款信息放入users中
    for(let k = 0; k < ordersAmount.length;k++){
        for(let i = 0 ;i < users.length ;i++){
            let userId = users[i].id;
            if(userId === ordersAmount[k].userId){
                users[i].dataValues.orderAmount = ordersAmount[k].orderAmount;
            };
        };
    };
    //如果有的用户没有历史订单信息和已付款信息，那么将两值设为0
        users.forEach(function(item,index){
            let user = item.dataValues;
            if(!user.orderQuantity){
                user.orderQuantity = 0;
            }
            if(!user.orderAmount){
                user.orderAmount = 0;
            }
        });
        //获取总页数
        let totalPages;
        //没有省市区参数时的分页情况，查询所有数据进行总页数的添加
        if(userName.length==0&&phoneNum.length==0&&wechatName.length==0&&
            startDate.length==0&&endDate.length==0&&state.length==0&&
            city.length==0&&region.length==0){
            let page = {
                query: {},
                pagination:{page:1,limit:1000}
            };
            let pages = yield User.queryAll(page);
            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;
        }
        //有省市区参数时的分页情况，查询该参数的所有数据进行总页数的添加
        if(userName.length!==0||phoneNum.length!==0||wechatName.length!==0||
            startDate.length!==0||endDate.length!==0||state.length!==0||
            city.length!==0||region.length!==0){
            let page = {
                query: {},
                pagination:{page:1,limit:1000}
            };
            page.query.userName = userName;
            page.query.phoneNum = phoneNum;
            page.query.wechatName = wechatName;
            page.query.startDate = startDate;
            page.query.endDate = endDate;
            page.query.state = state;
            page.query.city = city;
            page.query.region = region;
            let pages = yield User.queryAll(page);

            totalPages = pages.length / +options.pagination.limit;
            totalPages = (totalPages > 1)
                ? Math.ceil(+totalPages)//向上取整，有小数就加一
                : 1;
        }
        let returnUsers={
                totalPages:totalPages,
                userNum:users.length,
                data:users
        };
        return res.jsonp(returnUsers);
    }).catch(function (err) {
        return next(err);
    });
};

const queryUsers = function (req, res, next) {
    //查询参数，如果不输入则默认为空进行查询
    let queryUtils = require('../../utils/queryUtils');
    let userName = queryUtils.parseQueryStrings(req.body.userName);
    let phoneNum = queryUtils.parseQueryStrings(req.body.phoneNum);
    let wechatName = queryUtils.parseQueryStrings(req.body.wechatName);
    let startTime = queryUtils.parseQueryStrings(req.body.startTime);
    let endTime = queryUtils.parseQueryStrings(req.body.endTime);
    let state = queryUtils.parseQueryStrings(req.body.state);
    let city = queryUtils.parseQueryStrings(req.body.city);
    let region = queryUtils.parseQueryStrings(req.body.region);
    
    let options = {
        query: {},
        pagination:req.pagination
    };
    options.query.userName = userName;
    options.query.phoneNum = phoneNum;
    options.query.wechatName = wechatName;
    options.query.startTime = startTime;
    options.query.endTime = endTime;
    options.query.state = state;
    options.query.city = city;
    options.query.region = region;
    console.log(options);
    
    co(function*() {
        let hospitals = yield Hospital.queryAll(options);    
        if(hospitals){
            return res.jsonp(hospitals);
        }else{
            let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};



const getUsersId = function (req, res, next) {
    return res.jsonp(req.targetUser);
};

const deleteUsersId = function (req, res, next) {
    co(function *() {
        let user = req.targetUser;
        let supervision = yield user.getSupervision();
        let work = yield user.getWork();
        let admin = yield user.getAdmin();
        let sequelize = require('../../models').sequelize;
        yield sequelize.transaction(function (t) {
            return user.destroy({transaction: t})
                .then(function () {
                    if (supervision) {
                        return supervision.destroy({transaction: t});
                    }
                    return user;
                }).then(function () {
                    if (work) {
                        return work.destroy({transaction: t});
                    }
                    return user;
                }).then(function () {
                    if (admin) {
                        return admin.destroy({transaction: t});
                    }
                    return user;
                });
        });
        return res.jsonp(user);
    }).catch(function (err) {
        next(err);
    });
};

const patchUsersId = function (req, res, next) {
    let values = _.pickBy(req.body, _.identity);
    req.targetUser.update(values).then(function (user) {
        return res.jsonp(user);
    }).catch(function (err) {
        next(err);
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

const postUsers = function (req, res, next) {
    co(function*() {
        let username = req.body.username;
        let password = req.body.password;
        let phoneNum = req.body.phoneNum;

        let user = yield User.create({
            username: username,
            password: password,
            phoneNum: phoneNum
        });

        return res.jsonp(user);
    }).catch(function (err) {
        return next(err);
    });
};

// const getCustomers = function (req, res, next) {
//     co(function *() {
//         let customers = yield Customer.getCustomers();
//         return res.jsonp(customers);
//     }).catch(function (err) {
//         return next(err);
//     });
// };


//获取后台所需要的用户信息表单
exports.getUsers = [checkPermission(Permissions.ADMIN_USERS_LIST), getUsers];
//获取后台所需要的单个用户信息
exports.getUsersId = [checkPermission(Permissions.ADMIN_USERS_READ), findUser, getUsersId];


exports.deleteUsersId = [checkPermission(Permissions.ADMIN_USERS_DELETE), findUser, deleteUsersId];
exports.patchUsersId = [checkPermission(Permissions.ADMIN_USERS_UPDATE), findUser, patchUsersId];
exports.postUsers = [checkPermission(Permissions.ADMIN_USERS_CREATE), postUsers];
//exports.getCustomers = [checkPermission(Permissions.ADMIN_USERS_LIST), getCustomers];>>>>>>> .r1164
