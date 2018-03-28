"use strict";
module.exports = function (sequelize, DataTypes) {
    const OrderRating = sequelize.define("orderRating", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        comment: {
            type: DataTypes.TEXT,
            comment: '评价'

        },
        ratingSkill: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 5,
            validate: {min: 1, max: 5},
            comment: '评价技能'
        },
        ratingAttitude: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 5,
            validate: {min: 1, max: 5},
            comment: '评价态度'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: '评论时间'
        }
    }, {
        comment: '订单评价表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: true
    });
    //类方法
    OrderRating.associate = function (models) {
        OrderRating.belongsTo(models.order, {
            unique: true
        });
    };
    //实例方法
    OrderRating.prototype.toJSON = function () {
        let moment = require('moment');
        let _ = require('lodash');
        let values = this.dataValues;
        values.OrderRating_Id = values.id;
        values.createdAt = moment(values.createdAt).format('YYYY-MM-DD HH:mm:ss');

        let excludeValue = ['ctime', 'utime', 'dtime','id'];
        values = _.omit(values, excludeValue);
        // let fields = [
        //     "id",
        //     "comment",
        //     "ratingSkill",
        //     "ratingAttitude"
        // ];
        // values = _.pick(values, fields);
        return values;
    };

    return OrderRating;
};