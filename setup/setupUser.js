var User = require('../models').user;
var Admin = require('../models').admin;
var Role = require('../models').role;
var AdminRole = require('../setup/adminRoles');
var md5 = require('blueimp-md5');

var co = require('co');
exports.createDefaultUsers = function () {
    
    return co(function*() {
        var system = yield User.create({
            name: 'SYSTEM',
            username: 'SYSTEM',
            password: 'SYSTEM',
            phoneNum: "00000000000"
        });

        var callCenter = yield User.create({
            name: 'CALLCENTER',
            username: 'CALLCENTER',
            password: md5('CALLCENTER'),
            phoneNum: "13800138001"
        });

        var accountant = yield User.create({
            name: 'ACCOUNTANT',
            username: 'ACCOUNTANT',
            password: md5('ACCOUNTANT'),
            phoneNum: "13800138002"
        });

        var admin = yield User.create({
            name: 'ADMIN',
            username: 'ADMIN',
            password: md5('ADMIN'),
            phoneNum: "13800138003"
        });

        var adminCallCenter = yield Admin.create({
            userId: callCenter.id,
            status: Admin.STATUS_APPROVED
        });

        var adminAccountant = yield Admin.create({
            userId: accountant.id,
            status: Admin.STATUS_APPROVED
        });

        var adminAdmin = yield Admin.create({
            userId: admin.id,
            status: Admin.STATUS_APPROVED
        });

        var roleAdmin = yield Role.findOne({
            where: {
                name: AdminRole.ROLE_ADMIN.name
            }
        });

        var roleCallCenter = yield Role.findOne({
            where: {
                name: AdminRole.ROLE_CALL_CENTER.name
            }
        });

        var roleAccountant = yield Role.findOne({
            where: {
                name: AdminRole.ROLE_ACCOUNTANT.name
            }
        });

        yield adminAdmin.setRoles(roleAdmin);
        yield adminAccountant.setRoles(roleAccountant);
        yield adminCallCenter.setRoles(roleCallCenter);

        console.log("createDefaultUsers ok");

        return true;
    }).catch(function (err) {
        console.log(err);
        return false;
    });
};
