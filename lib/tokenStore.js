"use strict";
const redisClient = require('./redisClient').client;
const redis = require('./redisClient').redis;
const util = require('util');

const userTokenFormat = "user:%s:token:%s";

const verifyToken = function (userId, token, callback) {
    let key = util.format(userTokenFormat, userId, token);
    redisClient.get(key, function (err, reply) {
        if (err) {
            callback(err);
            return;
        }
        if (reply) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
};

const expireToken = function (userId, token, callback) {
    if (!userId) {
        return;
    }
    if (token) {
        let key = util.format(userTokenFormat, userId, token);
        redisClient.del(key); 
    } else {
        listTokens(userId, function (err, keys) {
            if (err) {
                return;
            }
            keys.forEach(function (key) {
                redisClient.del(key);
            })
        });
    }
};

const setToken = function (userId, token, expiredInSeconds, callback) {
    if (!userId || !token) {
        return;
    }
    let key = util.format(userTokenFormat, userId, token);
    let value = token;
    redisClient.set(key, value, function (err, val) {
        if (err) {
            callback(err);
        } else {
            callback(null, value);
        }
    });
    if (expiredInSeconds) {
        redisClient.expire(key, expiredInSeconds, redis.print);
    }
};

const listTokens = function (userId, callback) {
    let key;
    if (userId) {
        key = util.format("user:%s:token:*", userId);
    } else {
        key = util.format("user:*:token:*");
    }
    redisClient.keys(key, function (err, keys) {
        if (callback) {
            callback(err, keys);
        }
        console.log(keys);
    });
};

module.exports = {
    listTokens: listTokens,
    setToken: setToken,
    verifyToken: verifyToken,
    expireToken: expireToken
};