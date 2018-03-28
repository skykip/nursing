"use strict";
module.exports = function (sequelize, DataTypes) {
    const Payment = sequelize.define("payment", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '付款结果'
        }
    }, {
        comment: '付款表',
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
    Payment.associate = function(models) {
        Payment.belongsTo(models.order , {
            'through': {
                model: models.orderPayment
            }
        });
        Payment.belongsTo(models.user, {as: 'payer'});
    };
    //实例方法
    Payment.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let excludeValue = ['ctime', 'utime', 'dtime'];
        values = _.omit(values, excludeValue);
        return values;
    };
   
    return Payment;
};