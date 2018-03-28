"use strict";
const co = require('co');
const sms = require('./smsHelper');
const VerifyCode = require('../models').verifyCode;

const VERIFY_PHONE_NUM = 0;

exports.VERIFY_PHONE_NUM = VERIFY_PHONE_NUM;
exports.sendVerifyPhoneNum = function (phoneNum) {
    return co(function *() {
        console.log('sendVerifyPhoneNum phoneNum=', phoneNum);
        let type = VERIFY_PHONE_NUM;
        let lastCode = yield VerifyCode.findLastOne(phoneNum, type);
        let expiredIn = 5 * 60 * 1000;
        let resendIn = 60 * 1000;

        if (lastCode && !lastCode.canResend()) {
            console.log('sendVerifyPhoneNum lastCode=', lastCode.verifyCode);
            return false;
        }
        let verifyCode = ("" + Math.random()).substring(2, 8);
        let sent = yield sms.sendSms(phoneNum, verifyCode);
        console.log('sendVerifyPhoneNum sent=', sent);
        if (!sent) {
            return false;
        }

        yield VerifyCode.destroy({
            where: {
                phoneNum: phoneNum,
                type: type
            }
        });

        yield VerifyCode.create({
            phoneNum: phoneNum,
            verifyCode: verifyCode,
            type: type,
            expiredIn: expiredIn,
            resendIn: resendIn
        });
        return true;
    }).catch(function (e) {
        console.log('sendVerifyPhoneNum e=', e)
    });
};

exports.checkVerifyPhoneNum = function (phoneNum, verifyCode) {
    return co(function *() {
        let code = yield VerifyCode.findLastOne(phoneNum, VERIFY_PHONE_NUM);
        if (!code) {
            return false;
        }
        if (code.isExpired()) {
            return false;
        }
        let verified = verifyCode === code.verifyCode;
        if (verified) {
            yield VerifyCode.deleteAll(phoneNum, VERIFY_PHONE_NUM);
        }
        return verified;
    });
};
