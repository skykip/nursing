"use strict";
const co = require('co');
const express = require('express');
const router = express.Router();
const OAuth = require('wechat-oauth');

const tokenManager = require('../../lib/tokenManager');

const errors = require('../../errors/index');
const customerConfig = require('../../config/config')['wechat']['customer'];
const workerConfig = require('../../config/config')['wechat']['worker'];
const clientCustomer = new OAuth(customerConfig.appId, customerConfig.appSecret);
const clientWorker = new OAuth(workerConfig.appId, workerConfig.appSecret);

const User = require('../../models/index').user;

const parseHeadImage = function (imageUrl) {
    let avatar = imageUrl || "";
    let parsedAvatar = require('url').parse(avatar);
    if (!parsedAvatar.hostname) {
        avatar = null;
    }
    avatar = avatar || null;
    return avatar;
};

router.get('/:client', function(req, res, next) {
    const code = req.query.code;
    const redirectUrl = req.query.state;
    const client = req.params.client === 'customer' ? clientCustomer : clientWorker;
    if (!code) {
        return next(errors.newError(errors.types.TYPE_API_WECHAT_AUTH_NO_CODE));
    }
    client.getAccessToken(code, function (err, result) {
        if (err) {
            return next(errors.newError(errors.types.TYPE_API_WECHAT_AUTH_GET_ACCESS_TOKEN_FAILED));
        }
        const accessToken = result.data.access_token;
        const openId = result.data.openid;
        client.getUser(openId, function(err, result) {
            if (accessToken && result.openid) {
                co(function * () {
                    let user = yield User.queryByOpenId(result.openid);
                    if(!user) {
                        let gender = result.sex ? (result.sex === 1 ? User.GENDER_MALE : User.GENDER_FEMALE) : User.GENDER_UNKNOWN;
                        let username = result.openid + "@nursingWork";
                        let avatar = parseHeadImage(result.headimgurl);
                        if (avatar) {
                            avatar = avatar.replace("http://", "https://");
                        }
                        user = User.build({
                            openId: result.openid,
                            name: result.nickname,
                            gender: gender,
                            username: username,
                            avatar: avatar
                        });
                        user = yield user.save();
                    }
                    let token = tokenManager.generateToken(user.id);
                    res.cookie('token', token);
                    res.redirect(redirectUrl.replace("#wechat_redirect", ""));
                }).catch(function(err) {
                    return next(err);
                });
            } else {
                return next(errors.newError(errors.types.TYPE_API_WECHAT_AUTH_GET_ACCESS_TOKEN_FAILED));
            }
        });
    });
});

module.exports = router;
