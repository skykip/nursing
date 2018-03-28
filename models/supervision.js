"use strict";
const GENDER_MALE = 'male';
const GENDER_FEMALE = 'female';
const GENDER_UNKNOWN = 'unknown';

const GENDER = [
    GENDER_UNKNOWN,
    GENDER_FEMALE,
    GENDER_MALE
];

module.exports = function (sequelize, DataTypes) {
    const Supervision = sequelize.define("supervision", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: '名字'
        },
        gender: {
            type: DataTypes.ENUM,
            values: GENDER,
            allowNull: false,
            defaultValue: GENDER_UNKNOWN,
            comment: '性别'
        },
        phoneNum: {
            type: DataTypes.STRING(32),
            comment: '手机号码'
        },
        idCardNum: {
            type: DataTypes.STRING(20),
            comment: '身份证号码'
        },
        dtime: {
            type: DataTypes.DATE
            //unique: 'unique_supervision'
        }
    }, {
        comment: '督工表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: true
    });
    //类方法
    Supervision.associate = function (models) {
        Supervision.belongsTo(models.hospital, {
            foreignKey: {
                unique: 'unique_supervision',
                comment: '医院id'
            }
        });
        Supervision.belongsTo(models.user, {
            foreignKey: {
                unique: 'unique_supervision',
                comment: '用户id'
            }
        });
    };
    Supervision.queryById = function(supervisionId, includeDeleted) {
        let User = sequelize.model('user');
        let Hospital = sequelize.model('hospital');
        return Supervision.findOne({
            where: {
                id: supervisionId
            },
            include: [User, Hospital],
            paranoid: !includeDeleted
        });
    };
    Supervision.queryAll = function(){
        let User = sequelize.model('user');
        let Hospital = sequelize.model('hospital');
        return Supervision.findAll({
            include: [User, Hospital]
        });
    };
    Supervision.queryByHospitalId = function (hospitalId) {
        let User = sequelize.model('user');
        let Hospital = sequelize.model('hospital');
        return Supervision.findAll({
            where: {
                hospitalId: hospitalId
            },
            include: [User, Hospital]
        });
    };
    Supervision.queryDeleted = function () {
        let User = sequelize.model('user');
        let Hospital = sequelize.model('hospital');

        let whereClause = {
            dtime: {
                $ne: null
            }
        };
        return Supervision.findAll({
            where: whereClause,
            include: [User, Hospital],
            paranoid: false
        });
    };

    //实例方法
    Supervision.prototype.toJSON = function () {
            let _ = require('lodash');
            let values = this.dataValues;
            let fields = [
                "id",
                "name",
                "gender",
                "phoneNum",
                "status",
                "idCardNum",
                "user",
                "hospital"
            ];
            values = _.pick(values, fields);
            return values;
        };
  
    Supervision.GENDER_MALE = GENDER_MALE;
    Supervision.GENDER_FEMALE = GENDER_FEMALE;
    Supervision.GENDER_UNKNOWN = GENDER_UNKNOWN;
    Supervision.GENDER = GENDER;
    return Supervision;
};