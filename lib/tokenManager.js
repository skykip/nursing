"use strict";

const tokenStore = require('./tokenStore');
const config = require('../config/config');
const jwt = require('jwt-simple');

const TOKEN_EXPIRED_IN = 50 * 24 * 60 * 60 * 1000;
const TOKEN_EXPIRED_IN_ADMIN = 8 * 60 * 60 * 1000;

const generateTokenForWechat = function (userId) {
    return generateToken(userId, TOKEN_EXPIRED_IN);
};

const generateTokenForAdmin = function (userId) {
    return generateToken(userId, TOKEN_EXPIRED_IN_ADMIN);
};

const generateToken = function (userId, expiredIn) {
    expiredIn = expiredIn || TOKEN_EXPIRED_IN;
    let expiredAt = new Date().getTime() + expiredIn;
    let token = jwt.encode(
        {
            userId: userId,
            exp: expiredAt
        },
        config.tokenSecret,
        'HS512'
    );
    tokenStore.setToken(userId, token, expiredIn / 1000, function (err, token) {
        
    });
    return token;
};

const verifyToken = function (token, callback) {
    try {
        let decode = jwt.decode(token, config.tokenSecret, 'HS512');
        if (decode.exp <= Date.now()) {
            callback(null, null);
            return;
        }
        let userId = decode.userId;
        tokenStore.verifyToken(userId, token, (e, verified) => {
            if (verified) {
                callback(null, decode);
            } else {
                callback(null, null);
            }
        });
    } catch (err) {
        callback(err);
    }
};

const expireToken = function (token) {
    try {
        let decode = jwt.decode(token, config.tokenSecret, 'HS512');
        let userId = decode.userId;
        tokenStore.expireToken(userId, token);
    } catch (err) {

    }
};

const expireUserTokens = function (userId) {
    tokenStore.expireToken(userId, null, null);
};

module.exports = {
    generateToken: generateToken,
    generateTokenForWechat: generateTokenForWechat,
    generateTokenForAdmin: generateTokenForAdmin,
    verifyToken: verifyToken,
    expireToken: expireToken,
    expireUserTokens: expireUserTokens
};