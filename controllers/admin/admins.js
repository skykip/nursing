"use strict";
const _ = require('lodash');
const Admin = require('../../models/index').admin;
const Role = require('../../models/index').role;
const co = require('co');
const errors = require('../../errors/index');
const Permissions = require('../../setup/adminPermissions');

const findAdmin = function (req, res, next) {
    let adminId = req.params.adminId;
    co(function*() {
        let admin = yield Admin.queryById(adminId);
        if (!admin) {
            let error = errors.newError(errors.types.TYPE_API_WORK_NOT_FOUND);
            return next(error);
        }
        req.targetAdmin = admin;
        return next();
    }).catch(function (err) {
        return next(err);
    });
};

const getAdminsId = function (req, res, next) {
    return res.jsonp(req.targetAdmin);
};

const getAdminsMe = function (req, res, next) {
    return res.jsonp(req.admin);
};

const getAdmins = function (req, res, next) {
    co(function *() {
        let admins = yield Admin.queryAll();
        let count = yield Admin.count();
        res.set('X-Pagination-Count', count);
        return res.jsonp(admins);
    }).catch(function (err) {
        return next(err);
    });
};

const deleteAdminsId = function (req, res, next) {
    co(function*() {
        let admin = req.targetAdmin;
        yield admin.destroy();
        return res.jsonp(admin);
    }).catch(function (err) {
        return next(err);
    });
};

const approveAdminsId = function (req, res, next) {
    let admin = req.targetAdmin;
    admin.status = Admin.STATUS_APPROVED;
    co(function *() {
        yield admin.save();
        return res.jsonp(admin);
    }).catch(function (err) {
        return next(err);
    });
};

const disapproveAdminsId = function (req, res, next) {
    let admin = req.targetAdmin;
    admin.status = Admin.STATUS_DISAPPROVED;
    co(function *() {
        yield admin.save();
        return res.jsonp(admin);
    }).catch(function (err) {
        return next(err);
    });
};

const patchAdminsId = function (req, res, next) {
    let admin = req.targetAdmin;
    let roles = req.body.roles;
    roles = [].concat(roles || []);
    co(function *() {
        roles = _.flatMap(roles, function (value) {
            if (!value) return null;
            if (!value.name) return null;
            return value.name;
        });
        roles = _.filter(roles, _.identity);
        if (roles.length) {
            // 当前只支持一个角色
            let role = yield Role.findOne({
                where: {
                    name: {
                        in: roles
                    }
                }
            });
            yield admin.setRoles(role);
        }
        yield admin.reload();
        return res.jsonp(admin);
    }).catch(function (err) {
        return next(err);
    });
};

const postAdmins = function (req, res, next) {
    let userId = req.body.userId;
    let roles = req.body.roles;
    roles = [].concat(roles || []);
    roles = _.flatMap(roles, function (value) {
        if (!value) return null;
        if (!value.name) return null;
        return value.name;
    });
    roles = _.filter(roles, _.identity);
    co(function*() {
        let admin = yield Admin.create({
            userId: userId,
            status: Admin.STATUS_APPROVED
        });

        if (roles.length) {
            // 当前只支持一个角色
            let role = yield Role.findOne({
                where: {
                    name: {
                        in: roles
                    }
                }
            });
            yield admin.setRoles(role);
        }
        admin = yield Admin.queryById(admin.id);
        return res.jsonp(admin);
    }).catch(function (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            err = errors.newError(errors.types.TYPE_API_CONFLICT);
        }
        return next(err);
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

exports.getAdmins = [checkPermission(Permissions.ADMIN_ADMINS_LIST), getAdmins];
exports.getAdminsId = [checkPermission(Permissions.ADMIN_ADMINS_READ), findAdmin, getAdminsId];
exports.getAdminsMe = [getAdminsMe];
exports.patchAdminsId = [checkPermission(Permissions.ADMIN_ADMINS_UPDATE), findAdmin, patchAdminsId];
exports.deleteAdminsId = [checkPermission(Permissions.ADMIN_ADMINS_DELETE), findAdmin, deleteAdminsId];
exports.postAdmins = [checkPermission(Permissions.ADMIN_ADMINS_CREATE), postAdmins];
exports.approveAdminsId = [checkPermission(Permissions.ADMIN_ADMINS_REVIEW), findAdmin, approveAdminsId];
exports.disapproveAdminsId = [checkPermission(Permissions.ADMIN_ADMINS_REVIEW), findAdmin, disapproveAdminsId];