"use strict";
module.exports = function (sequelize, DataTypes) {
    const VerifyCode = sequelize.define("verifyCode", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        phoneNum: {
            type: DataTypes.STRING(32),
            comment: '手机号码'
        },
        verifyCode: {
            type: DataTypes.STRING(32),
            allowNull: false,
            comment: '验证码'
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '验证码类型'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: '生成时间'
        },
        resendIn: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '重发冷却时间'
        },
        expiredIn: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '过期时间'
        }
    }, {
        comment: '验证码表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false
    });
    //类方法
    VerifyCode.associate = function (models) {
        
    };

    VerifyCode.findLastOne = function (phoneNum, type) {
        return VerifyCode.findOne({
            where: {
                phoneNum: phoneNum,
                type: type
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
    };
    VerifyCode.deleteAll = function (phoneNum, type) {
        return VerifyCode.destroy({
            where: {
                phoneNum: phoneNum,
                type: type
            }
        });
    };
    //实例方法
    VerifyCode.prototype.isExpired = function () {
        return (this.createdAt.getTime() + this.expiredIn) < Date.now();
    };

    VerifyCode.prototype.canResend = function () {
        return (this.createdAt.getTime() + this.resendIn) < Date.now();
    };
    
    return VerifyCode;
};