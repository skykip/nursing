"use strict";
module.exports = function (sequelize, DataTypes) {
    const CheckIn = sequelize.define("checkIn", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        address: {
            type: DataTypes.STRING,
            comment: '详细位置'
        },
        date: {
            type: DataTypes.DATE,
            comment: '签到时间'
        },
        longitude: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: null,
            validate: {min: -180, max: 180},
            comment: '经度'
        },
        latitude: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: null,
            validate: {min: -90, max: 90},
            comment: '纬度'
        }
    }, {
        comment: '签到表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: true,
        indexes: [
            {
                fields: ['orderId']
            }
        ]
    });

    //类方法
    CheckIn.associate = function (models) {
        CheckIn.belongsTo(models.order);
    };
    //实例方法
    CheckIn.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let excludeValue = ['ctime', 'utime', 'dtime'];
        values = _.omit(values, excludeValue);
        return values;
    }
    
    return CheckIn;
};