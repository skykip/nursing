"use strict";
module.exports = function (sequelize, DataTypes) {
    const WechatLocation = sequelize.define("wechatLocation", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        openId: {
            comment: '微信OpenId',
            type: DataTypes.STRING(191),
            allowNull: false
        },
        date: {
            comment: '时间',
            type: DataTypes.DATE,
            allowNull: false
        },
        longitude: {
            comment: '经度',
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: null,
            validate: {min: -180, max: 180}
        },
        latitude: {
            comment: '纬度',
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: null,
            validate: {min: -90, max: 90}
        }
    }, {
        comment: '微信地理位置表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        indexes: [{
            fields: ['openId']
        }],
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: true
    });
    //类方法
    WechatLocation.associate = function (models) {

    }
    return WechatLocation;
};