var roles = require('./adminRoles').roles;
var permissions = require('./adminPermissions').permissions;
var Role = require('../models').role;
var Permission = require('../models').permission;

var permissionMap = {};
var roleMap = {};

var co = require('co');
exports.createRolesAndPermissions = function () {
    return co(function*() {
        console.log("Delete all role");
        yield Role.destroy({
            where: {}
        });
        console.log("Delete all permission");
        yield Permission.destroy({
            where: {}
        });
        var permissionsValues = [];
        permissions.forEach(function (value) {
            permissionsValues.push({
                name: value
            });
        });
        yield Permission.bulkCreate(permissionsValues, {returning: true});
        yield Role.bulkCreate(roles, {returning: true});

        var permissionModels = yield Permission.findAll();
        var roleModels = yield Role.findAll();

        roleModels.forEach(function (roleModel) {
            if (!roleMap[roleModel.name]) {
                roleMap[roleModel.name] = roleModel;
            }
        });
        permissionModels.forEach(function (permissionModel) {
            if (!permissionMap[permissionModel.name]) {
                permissionMap[permissionModel.name] = permissionModel;
            }
        });

        for (var i = 0; i < roles.length; i++) {
            for (var j = 0; j < roles[i].permissions.length; j++) {
                var role = roles[i];
                var permissionName = role.permissions[j];
                yield roleMap[role.name].addPermissions(permissionMap[permissionName])
            }
        }
        console.log("createDefaultSettings ok");
        return true;
    }).catch(function (err) {
        console.log(err);
        return false;
    });
};
