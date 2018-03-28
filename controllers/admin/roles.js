"use strict";
const co = require('co');
const _ = require('lodash');
const User = require('../../models').user;
const Role = require('../../models').role;
const Permission = require('../../models').permission;
const errors = require('../../errors');
const Permissions = require('../../setup/adminPermissions');

const getRoles = function (req, res, next) {

    co(function *() {
        let roles = yield Role.findAll({
            include: [Permission]
        });
        return res.jsonp(roles);
    }).catch(function (err) {
        return next(err);
    });
};

const findRole = function (req, res, next) {
    let roleId = req.params.roleId;
    Role.findOne({
        where: {
            id: roleId
        },
        include: [Permission]
    }).then(function (role) {
        if (!role) {
            return next(new Error());
        } else {
            req.role = role;
            return next();
        }
    }).catch(function (err) {
        return next(err);
    });
};

const getRolesId = function (req, res, next) {
    return res.jsonp(req.role);
};

const deleteRolesId = function (req, res, next) {
    req.role.destroy().then(function () {
        return res.jsonp(req.role);
    }).catch(function (err) {
        return next(err);
    });
};

const patchRolesId = function (req, res, next) {
    let role = req.role;
    let name = req.body.name;
    let permissions = req.body.permissions;
    permissions = [].concat(permissions || permissions);
    co(function *() {
        if (name) {
            role.name = name;
            role = yield role.save();
        }
        if (permissions.length) {
            permissions = _.flatMap(permissions, function (value) {
                if (!value) return null;
                if (!value.name) return null;
                return value.name;
            });
            permissions = _.filter(permissions, _.identity);
            permissions = _.pickBy(permissions, function (value) {
                return Permissions.permissionsNotAssignable.indexOf(value.name) === -1;
            });
            let permission = yield Permission.findAll({
                where: {
                    name: {
                        in: permissions
                    }
                }
            });
            yield role.setPermissions(permission);
        }
        yield role.reload();
        return res.jsonp(role);
    }).catch(function (err) {
        return next(err);
    });
};

const postRoles = function (req, res, next) {
    let name = req.body.name;
    let permissions = req.body.permissions;

    permissions = [].concat(permissions || permissions);
    co(function *() {
        if (permissions.length) {
            permissions = _.flatMap(permissions, function (value) {
                if (!value) return null;
                if (!value.name) return null;
                return value.name;
            });
            permissions = _.filter(permissions, _.identity);
            permissions = _.pickBy(permissions, function (value) {
                return Permissions.permissionsNotAssignable.indexOf(value.name) === -1;
            });
            let permission = yield Permission.findAll({
                where: {
                    name: {
                        in: permissions
                    }
                }
            });

        }
        let role = yield Role.create({
            name: name
        });
        yield role.setPermissions(permission);
        yield role.reload();
        return res.jsonp(role);
    }).catch(function (err) {
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

exports.getRoles = [checkPermission(Permissions.ADMIN_ROLES_LIST), getRoles];
exports.getRolesId = [checkPermission(Permissions.ADMIN_ROLES_READ), findRole, getRolesId];
exports.deleteRolesId = [checkPermission(Permissions.ADMIN_ROLES_DELETE), findRole, deleteRolesId];
exports.patchRolesId = [checkPermission(Permissions.ADMIN_ROLES_UPDATE), findRole, patchRolesId];
exports.postRoles = [checkPermission(Permissions.ADMIN_ROLES_CREATE), postRoles];