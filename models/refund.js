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

module.exports = function (sequelize, DataTypes) {
    const Refund = sequelize.define("refund", {
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
            comment: '支付途径'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: '生成时间'
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '退款结果'
        }
    }, {
        comment: '退款表',
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
    Refund.associate = function (models) {
        Refund.belongsTo(models.user, {as: 'payee'});
        Refund.belongsTo(models.order, {
            'through': {
                model: models.orderPayment
            }
        });
    };
    //实例方法
    Refund.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let excludeValue = ['ctime', 'utime', 'dtime'];
        values = _.omit(values, excludeValue);
        return values;
    };

    Refund.METHOD_WECHAT = METHOD_WECHAT;
    Refund.METHOD = METHOD;
    Refund.STATUS_IDLE = STATUS_IDLE;
    Refund.STATUS_PROCESSING = STATUS_PROCESSING;
    Refund.STATUS_FAIL = STATUS_FAIL;
    Refund.STATUS_SUCCESS = STATUS_SUCCESS;
    Refund.STATUS = STATUS;

    return Refund;
};