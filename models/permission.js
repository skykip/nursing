"use strict";
module.exports = function (sequelize, DataTypes) {
    const Permission = sequelize.define("permission", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: {
                msg: "Name can not be empty"
            },
            unique: {
                msg: "Permission name should be unique"
            },
            comment: '权限名'
        }
    }, {
        comment: '权限表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false
    });
    //类方法
    Permission.associate = function (models) {
        let Role = models.role;
        let RolePermission = models.rolePermission;
        Permission.belongsToMany(Role, {
            'through': {
                model: RolePermission
            }
        });
        Role.belongsToMany(Permission, {
            'through': {
                model: RolePermission
            }
        });
    };
    //实例方法
    Permission.prototype.toJSON = function () {
        let fields = [
            "id",
            "name"
        ];
        let _ = require('lodash');
        let values = this.dataValues;
        values = _.pick(values, fields);
        return values;
    };
    return Permission;
};