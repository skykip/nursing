"use strict";
module.exports = function (sequelize, DataTypes) {
    const UserBlockedWork = sequelize.define("userBlockedWork", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        comment: '用户屏蔽护工表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false,
        indexes: [
            {
                fields: ['userId']
            }
        ]
    });
    //类方法
    UserBlockedWork.associate = function (models) {
        UserBlockedWork.belongsTo(models.user, {
            foreignKey: {
                unique: "unique_user_work",
                comment: '用户id'
            }
        });
        UserBlockedWork.belongsTo(models.work, {
            foreignKey: {
                unique: "unique_user_work",
                comment: '护工id'
            }
        });
    };
    UserBlockedWork.queryByUserId = function (userId) {
        return UserBlockedWork.findAll({
            where: {
                userId: userId
            }
        });
    };
    UserBlockedWork.queryByWorkId = function (workId) {
        return UserBlockedWork.findAll({
            where: {
                workId: workId
            },
            order: [
                ['ctime', 'DESC']
            ]
        });
    };

    //实例方法
    UserBlockedWork.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let fields = [
            "id",
            "user",
            "work"
        ];
        values = _.pick(values, fields);
        return values;
    }
    
    return UserBlockedWork;
};