"use strict";
const METHOD_WECHAT = 'wechat';

const METHOD = [
    METHOD_WECHAT
];

const STATUS_IDLE = "idle";
const STATUS_PROCESSING = 'processing';
const STATUS_FAIL = 'fail';
const STATUS_SUCCESS = 'success';

const STATUS = [
    STATUS_IDLE,
    STATUS_SUCCESS,
    STATUS_FAIL,
    STATUS_PROCESSING
];

const TYPE_SALARY = "salary";
const TYPE = [
    TYPE_SALARY
];

module.exports = function (sequelize, DataTypes) {
    const Transfer = sequelize.define("transfer", {
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
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: '金额'
        },
        method: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: METHOD_WECHAT,
            comment: '支付方式'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: '创建时间'
        },
        reason: {
            type: DataTypes.TEXT,
            comment: '转账原因'
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '转账结果'
        }
    }, {
        comment: '转账表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false,
        getterMethods: {
            object: function () {
                let json = this.getDataValue('value');
                try {
                    return JSON.parse('' + json);
                } catch (e) {
                    return {};
                }
            }
        },
        setterMethods: {
            object: function (value) {
                this.setDataValue('value', JSON.stringify(value));
            }
        }
    });

    //类方法
    Transfer.associate = function (models) {
        Transfer.belongsTo(models.user, {as: 'payee'});
    };
    //实例方法
    Transfer.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let excludeValue = ['ctime', 'utime', 'dtime'];
        values = _.omit(values, excludeValue);
        return values;
    };
    Transfer.METHOD_WECHAT = METHOD_WECHAT;
    Transfer.METHOD = METHOD;
    Transfer.STATUS_IDLE = STATUS_IDLE;
    Transfer.STATUS_PROCESSING = STATUS_PROCESSING;
    Transfer.STATUS_FAIL = STATUS_FAIL;
    Transfer.STATUS_SUCCESS = STATUS_SUCCESS;
    Transfer.STATUS = STATUS;
    Transfer.TYPE = TYPE;
    Transfer.TYPE_SALARY = TYPE_SALARY;
    return Transfer;
};