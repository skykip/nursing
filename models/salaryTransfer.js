"use strict";
module.exports = function (sequelize, DataTypes) {
    const SalaryTransfer = sequelize.define("salaryTransfer", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        comment: '工资-转账中间表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false
    });

    //实例方法
    SalaryTransfer.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let excludeValue = ['ctime', 'utime', 'dtime'];
        values = _.omit(values, excludeValue);
        return values;
    }
    return SalaryTransfer;
};