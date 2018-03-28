"use strict";
const express = require('express');
const router = express.Router();
const admins = require('./admins');
 const users = require('./users');
 const works = require('./works');
 const orders = require('./orders');
// const orderWorks = require('./orderWorks');
// const cities = require('./cities');
const hospitals = require('./hospitals');
// const salaries = require('./salaries');
// const statistics = require('./statistics');
// const permissions = require('./permissions');
const roles = require('./roles');
// const supervisions = require('./supervisions');
// const prices = require('./prices');
// const reviewLogs = require('./reviewLogs');
// const finances = require('./finances');
const Admin = require('../../models').admin;
const errors = require('../../errors');
const co = require('co');

const checkAdmin = function (req, res, next) {
    co (function *() {
        req.user = {
            id:5
        };
        if (!req.user) {
            let error = errors.newError(errors.types.TYPE_API_FORBIDDEN);
            return next(error);
        }
        req.admin = yield Admin.queryByUserId(req.user.id);
        if (!req.admin) {
            let error = errors.newError(errors.types.TYPE_API_FORBIDDEN);
            return next(error);
        }
        if (!req.admin.isActive()) {
            let error = errors.newError(errors.types.TYPE_API_FORBIDDEN);
            return next(error);
        }
        return next();
    }).catch(function (err) {
        return next(err);
    });
};

router.use(checkAdmin);
router.use('/admins', admins);
router.use('/users', users);
router.use('/works', works);
router.use('/orders', orders);
// router.use('/order-works', orderWorks);
// router.use('/cities', cities);
router.use('/hospitals', hospitals);
// router.use('/salaries', salaries);
// router.use('/statistics', statistics);
// router.use('/permissions', permissions);
router.use('/roles', roles);
// router.use('/supervisions', supervisions);
// router.use('/prices', prices);
// router.use('/review-logs', reviewLogs);
// router.use('/finances', finances);

module.exports = router;
