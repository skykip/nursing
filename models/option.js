"use strict";
module.exports = function (sequelize, DataTypes) {
    const Option = sequelize.define("option", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: '键'
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '值'
        }
    }, {
        comment: '设置表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false
    });
    //类方法
    Option.associate = function(models) {
        
    };
    Option.find = function (key) {
        return Option.findOne({
            where: {
                key: key
            }
        });
    };
    Option.getValue = function (key) {
        return this.find(key).then(function (option) {
            if (option) {
                return option.value;
            } else {
                return undefined;
            }
        });
    };
    Option.setValue = function (key, value) {
        return this.find(key).then(function (option) {
            if (option) {
                option.value = value;
                return option.save();
            } else {
                return Option.create({
                    key: key,
                    value: value
                });
            }
        });
    };
    Option.getNumber = function (key) {
        return this.getValue(key).then(function (value) {
            if (!value) return NaN;
            return +value;
        });
    };
    Option.setNumber = function (key, value) {
        value = '' + value;
        return this.setValue(key, value);
    };
    Option.getString = function (key) {
        return this.getValue(key);
    };
    Option.setString = function (key, value) {
        return this.setValue(key, value);
    };
    Option.getObject = function (key) {
        return this.getString(key).then(function (value) {
            if (!value) return {};
            try {
                return JSON.parse(value);
            } catch (e) {
                return {};
            }
        });
    };
    Option.setObject = function (key, value) {
        return this.setString(key, JSON.stringify(value));
    };
    //实例方法
    Option.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let excludeValue = ['ctime', 'utime', 'dtime'];
        values = _.omit(values, excludeValue);
        return values;
    }
    
    return Option;
};