"use strict";
const co = require('co');
const _ = require('lodash');
const User = require('../../models').user;
const Supervision = require('../../models').supervision;
const errors = require('../../errors');
const WXAPI = require('../../lib/wxapi');
const VerifyCodeHelper = require('../../lib/verifyCodeHelper');
const MessageSender = require('../../business/wxMessageSender');
const tokenManager = require('../../lib/tokenManager');


const findUser = function(req, res, next) {
    let userId = req.params.userId;
    if (userId === 'me') {
        req.targetUser = req.user;
        return next();
    }
    User.queryById(userId).then(function (user) {
        if (!user) {
            let error = errors.newError(errors.types.TYPE_API_USER_NOT_FOUND);
            return next(error);
        }
        req.targetUser = user;
        next();
    });
};

const checkUserIsOwner = function (req, res, next) {
    if (req.user.id === req.targetUser.id) {
        return next();
    } else {
        return next(errors.newError(errors.types.TYPE_API_FORBIDDEN));
    }
};

const patchUsersId = function (req, res, next) {
    
        co(function*() {
    
            let user = req.user;
            let phoneNum = req.body.phoneNum;
            let verifyCode = req.body.verifyCode;
            let name = req.body.name;
            let gender = req.body.gender;
    
            if (phoneNum) {
                let verified = yield VerifyCodeHelper.checkVerifyPhoneNum(phoneNum, verifyCode);
                if (!verified) {
                    let error = errors.newError(errors.types.TYPE_API_USER_INVALID_VERIFY_CODE);
                    return next(error);
                }
            }
    
            let values = {
                phoneNum: phoneNum,
                name: name,
                gender: gender
            };
    
            // if (phoneNum && user.phoneNum) {
            //     // 暂时不提供修改手机号的功能
            //     delete values.phoneNum;
            // }
    
            values = _.pickBy(values, _.identity);
            
            yield User.create(values);
            user = yield User.queryByPhoneNum(phoneNum);
            res.jsonp(user);
            // let supervision = yield Supervision.findOne({
            //     where: {
            //         phoneNum: phoneNum
            //     }
            // });
            // if (supervision && !supervision.userId) {
            //     supervision.userId = user.id;
            //     yield supervision.save();
            //     WXAPI.moveSupervisor(user.openId);
            //     MessageSender.sendSuccessMessage(user.openId);
    
            // }
            
        }).catch(function (err) {
            return next(err);
        });
    };


    const getUserById = function(req, res, next) {
        return res.jsonp(req.targetUser);
    };

    const patchUpdateUser = function (req, res, next) {
        let userId = req.params.userId;
        let name = req.body.userId;
        let birthday = req.body.userId;
        let gender = req.body.userId;
        let avatar = req.body.userId;
        co(function *() {
            let result = yield User.patchUpdateUser(userId, name, birthday, gender, avatar);
            //更新结果和需要修改的护工人数相等,
            // if (result[0] === salaries.length) {
            //     //TODO::未来肯定是按群组发送的, 不是这么一个一个发的
            //     if (req.body.status === Salary.STATUS_CONFIRM) {
            //         for (let j = 0; j < salaries.length; ++j) {
            //             MessageSender.sendSalaryMessage(salaries[j]);
            //         }
            //     }
            //     return res.jsonp(salaries);
            // } else {
            //     //异常
            // }
            return res.jsonp(salary);
        }).catch(function (err) {
            return next(err);
        });
    }

    const patchUpdateUsersId = function (req, res, next) {
        let values = _.pickBy(req.body, _.identity);
        req.targetUser.update(values).then(function (user) {
            return res.jsonp(user);
        }).catch(function (err) {
            next(err);
        });
    };

exports.getUserById = [findUser,getUserById];
exports.patchUpdateUsersId = [findUser,patchUpdateUsersId];
exports.patchUsersId = [findUser,patchUsersId];
