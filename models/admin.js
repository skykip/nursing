"use strict";

const STATUS_CHECKING = 'checking';
const STATUS_APPROVED = 'approved';
const STATUS_DISAPPROVED = 'disapproved';

const STATUS = [
    STATUS_CHECKING,
    STATUS_APPROVED,
    STATUS_DISAPPROVED
];

module.exports = function (sequelize, DataTypes) {
    const Admin = sequelize.define("admin", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: DataTypes.ENUM,
            values: STATUS,
            defaultValue: STATUS_CHECKING,
            comment: '状态'
        }
    }, {
        comment: '管理员表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false
    });
    //类方法
    Admin.associate = function (models) {
        let User = models.user;
        Admin.belongsTo(models.user, {
            foreignKey: {
                unique: true
            }
        });
        User.hasOne(Admin);
    };
    Admin.queryById =function (id) {
        let User = sequelize.model('user');
        let Role = sequelize.model('role');
        let Permission = sequelize.model('permission');
        return Admin.find({
            where: {
                id: id
            },
            include: [
                User,
                {
                    model: Role,
                    include: [Permission]
                }
            ]
        });
    };
    Admin.queryByUserId = function (userId) {
        let User = sequelize.model('user');
        let Role = sequelize.model('role');
        let Permission = sequelize.model('permission');
        return Admin.findOne({
            where: {
                userId: userId
            },
            include: [
                User,
                {
                    model: Role,
                    include: [Permission]
                }
            ]
        });
    },
    Admin.queryAll = function (userIds) {
        let User = sequelize.model('user');
        let Role = sequelize.model('role');
        let Permission = sequelize.model('permission');
        let options = {
            where: {},
            include: [
                User,
                {
                    model: Role,
                    include: [Permission]
                }
            ]
        };
        return Admin.findAll(options);
    };
    //实例方法
    Admin.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let fields = [
            "id",
            "status",
            "user",
            "roles"
        ];
        values = _.pick(values, fields);
        return values;
    };
    Admin.prototype.isActive = function () {
        return this.status === STATUS_APPROVED;
    };
    Admin.prototype.hasPermission = function (permissions) {
        let Role = sequelize.model('role');
        let Permission = sequelize.model('permission');
        let _this = this;
        return Admin.findOne({
            include: [
                {
                    model: Role,
                    include: [
                        {
                            model: Permission,
                            where: {
                                name: {
                                    in: permissions
                                }
                            }
                        }
                    ]
                }
            ],
            where: {
                userId: _this.userId
            }
        }).then(function (admin) {
            return admin !== null;
        }).catch(function (err) {
            return false;
        });
    };

    Admin.STATUS_CHECKING = STATUS_CHECKING;
    Admin.STATUS_APPROVED = STATUS_APPROVED;
    Admin.STATUS_DISAPPROVED = STATUS_DISAPPROVED;
    Admin.STATUS = STATUS;
    return Admin;
};