"use strict";
module.exports = function(sequelize, DataTypes) {
    const PaymentMethod = sequelize.define("paymentMethod", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        cardNum: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: '银行卡号'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: '姓名'
        },
        bank: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: '开户行'
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: '开户地址'
        }
    }, {
        comment: '支付方法表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: true
    });
    //类方法
    PaymentMethod.associate = function (models) {
                
    };
    //实例方法
    PaymentMethod.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        values.paymentMethod_id = values.id;
        let excludeValue = ['id','ctime', 'utime', 'dtime'];
        values = _.omit(values, excludeValue);
        return values;
    }
   
    return PaymentMethod;
};