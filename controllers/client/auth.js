"use strict";
const co = require('co');
const errors = require('../../errors/index');
const User = require('../../models').user;
const tokenManager = require('../../lib/tokenManager');
var md5 = require('blueimp-md5');

const postAuth = function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    console.log(md5("SYSTEM"));
    co(function *() {
        let user = yield User.queryByUsername(username);
        if (user) {
            let matched = yield user.comparePassword(password);
            if (matched) {
                // 密码正确
                let token = tokenManager.generateTokenForAdmin(user.id);
                res.cookie('token', token);
                return res.jsonp({token: token});
            } else {
                //密码不正确
                let error = errors.newError(errors.types.TYPE_API_USER_PWD_INVALID);
                return next(error);
            }
           
        } else {
            let error = errors.newError(errors.types.TYPE_API_USER_NOT_FOUND);
            console.log(error)
            return next(error);
        }
    }).catch(function (err) {
        console.log(err)
        return next(err);
    });
};

exports.postAuth = postAuth;