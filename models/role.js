"use strict";
module.exports = function (sequelize, DataTypes) {
    const Role = sequelize.define("role", {
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
                msg: "Role name should be unique"
            },
            comment: '角色名'
        }
    }, {
        comment: '管理员角色表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false
    });
    //类方法
    Role.associate = function (models) {
        let Admin = models.admin;
        let AdminRole = models.adminRole;
        Role.belongsToMany(Admin, {
            'through': {
                model: AdminRole
            }
        });
        Admin.belongsToMany(Role, {
            'through': {
                model: AdminRole
            }
        });
    };
    //实例方法
    Role.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        values = _.omit(values, ['ctime', 'utime', 'dtime', 'adminRole']);
        return values;
    };
   
    return Role;
};