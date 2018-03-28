"use strict";
module.exports = function (sequelize, DataTypes) {
    const Punishment = sequelize.define("punishment", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: '惩罚结束时间'
        }
    }, {
        comment: '护工惩罚表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false,
        indexes: [
            {
                fields: ['workId']
            }
        ]
    });
    //类方法
    Punishment.associate =  function (models) {
        Punishment.belongsTo(models.work, {
            foreignKey: {
                unique: "unique_user_work",
                comment: '护工id'
            }
        });
    };
    Punishment.queryByWorkId = function(workId) {
        return Punishment.findOne({
            where: {
                workId: workId
            }
        });
    };
    //实例方法
    Punishment.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let fields = [
            "id",
            "work",
            "endDate"
        ];
        values = _.pick(values, fields);
        return values;
    }
    
    return Punishment;
};