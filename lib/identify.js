"use strict";

const jwt = require('jwt-simple');
const moment = require('moment');
const errors = require('../errors');
const tokenManager = require('./tokenManager');
const User = require('../models').user;
const Rx = require('rx');
const Observable = Rx.Observable;

module.exports = function (req, res, next) {
    if (req.path.startsWith('/auth')) {
        next();
        return;
    }

    if (req.path.startsWith('/verify-code')) {
        next();
        return;
    }

    let accessToken = req.headers["x-access-token"];
    Observable.just(accessToken)
        .doOnNext(token => {
            if (!token) {
                throw errors.newError(errors.types.TYPE_API_AUTH_INVALID_TOKEN);
            }
        })
        .flatMap(token => {
            return Observable.fromNodeCallback(tokenManager.verifyToken)(token);
        })
        .map(tokenData => {
            if (!tokenData) {
                throw errors.newError(errors.types.TYPE_API_AUTH_INVALID_TOKEN);
            }
            return tokenData.userId;
        })
        .flatMap(userId => {
            return Observable.fromPromise(User.queryById(userId));
        })
        .doOnNext(user => {
            if (!user) {
                throw errors.newError(errors.types.TYPE_API_AUTH_INVALID_TOKEN);
            }
        })
        .doOnNext(user => {
            if (!user.phoneNum
                && !(req.path.startsWith('/user/me') && req.method === 'PATCH')) {
                throw errors.newError(errors.types.TYPE_API_AUTH_NOT_REGISTER);
            }
        })
        .subscribe(user => {
            req.user = user;
            next();
        }, e => {
            // next('route');
            next(e)
        });
};