"use strict";
const STATUS_ACTIVE = 'active';
const STATUS_INACTIVE = 'inactive';

const STATUS = [
    STATUS_ACTIVE,
    STATUS_INACTIVE
];

module.exports = function (sequelize, DataTypes) {
    const Communication = sequelize.define("communication", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        customerOpenId: {
            type: DataTypes.STRING,
            notNull: true,
            comment: '客户OpenId'
        },
        workerOpenId: {
            type: DataTypes.STRING,
            notNull: true,
            comment: '护工OpenId'
        },
        status: {
            type: DataTypes.ENUM,
            values: STATUS,
            defaultValue: STATUS_INACTIVE,
            comment: '状态'
        }
    }, {
        comment: '微信通信表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false,
        indexes: [
            {
                fields: ['customerOpenId', 'workerOpenId']
            }
        ]
    });
    //实例方法
    Communication.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let excludeValue = ['ctime', 'utime', 'dtime'];
        values = _.omit(values, excludeValue);
        return values;
    };
  

    Communication.STATUS_ACTIVE = STATUS_ACTIVE;
    Communication.STATUS_INACTIVE = STATUS_INACTIVE;
    Communication.STATUS = STATUS;

    return Communication;
};