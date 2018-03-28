"use strict";
const _ = require('lodash');
const errors = require('../../errors/index');
const co = require('co');
const verifyCodeHelper = require('../../lib/verifyCodeHelper');

const postVerifyCode = function (req, res, next) {
    let phoneNum = req.body.phoneNum;
    req.checkBody({
        phoneNum: {
            notEmpty: true,
            isMobilePhone: {
                options: ['zh-CN']
            },
            errorMessage: 'Phone number invalid'
        }
    });

    let validationErrors = req.validationErrors();

    if (validationErrors) {
        let error = errors.newError(errors.types.TYPE_API_VERIFY_CODE_INVALID_PHONE_NUMBER);
        return next(error);
    }
    
    co (function *() {
        let sent = verifyCodeHelper.sendVerifyPhoneNum(phoneNum);
        if (sent) {
            return res.status(201).jsonp({});
        } else {
            return res.status(400).jsonp({});
        }
    }).catch(function (err) {
        return next(err);
    })
};

exports.postVerifyCode = postVerifyCode;