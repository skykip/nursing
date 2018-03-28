"use strict";
const STATUS_APPROVED = 'approved';
const STATUS_DISAPPROVED = 'disapproved';

const STATUS = [
    STATUS_APPROVED,
    STATUS_DISAPPROVED
];

module.exports = function (sequelize, DataTypes) {
    const ReviewLog = sequelize.define("reviewLog", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: STATUS,
            comment: '状态'
        },
        changedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: '更新时间'
        }
    }, {
        comment: '审核日志表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false
    });
    //类方法
    ReviewLog.associate = function (models) {
        ReviewLog.belongsTo(models.work, {
            foreignKey: {
                comment: '护工id'
            }
        });
        ReviewLog.belongsTo(models.user, {
            foreignKey: {
                comment: '用户id'
            }
        });
    };
    ReviewLog.logReview = function(workId, status, userId) {
        return ReviewLog.create({
            status: status,
            workId: workId,
            userId: userId
        });
    };
    ReviewLog.queryAll = function (statuses) {
        let User = sequelize.model('user');
        let Work = sequelize.model('work');
        return ReviewLog.findAll({
            where: {
                status: {
                    in: statuses
                }
            },
            include: [
                {
                    model: Work,
                    paranoid: false
                },
                {
                    model: User,
                    paranoid: false
                }
            ]
        });
    };
    //实例方法
    ReviewLog.prototype.toJSON = function () {
        let fields = [
            "id",
            "status",
            "changedAt",
            "work",
            "user"
        ];
        let _ = require('lodash');
        let values = this.dataValues;
        values = _.pick(values, fields);
        return values;
    };

    ReviewLog.STATUS_DISAPPROVED = STATUS_DISAPPROVED;
    ReviewLog.STATUS_APPROVED = STATUS_APPROVED;

    ReviewLog.STATUS = STATUS;

    return ReviewLog;
};