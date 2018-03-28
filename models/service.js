"use strict";
const STATUS_ACTIVE = 'active';
const STATUS_INACTIVE = 'inactive';
//const DEPENDENT_LEVEL_INDEPENDENT = 'independent';
//const DEPENDENT_LEVEL_DEPENDENT = 'dependent';
//const DEPENDENT_LEVEL_PARTIALLY_INDEPENDENT = 'partially-independent';
const DEPENDENT_LEVEL_1 = 'level1';
const DEPENDENT_LEVEL_2 = 'level2';
const DEPENDENT_LEVEL_3 = 'level3';
const GENDER_MALE = 'male';
const GENDER_FEMALE = 'female';
const NURSING_TIME_DAY = 'day';
const NURSING_TIME_DAY_NIGHT = 'dayNight';
const NURSING_TIME_NIGHT = 'night';

const STATUS = [
    STATUS_ACTIVE,
    STATUS_INACTIVE
];

const NURSING_TIME = [
    NURSING_TIME_DAY,
    NURSING_TIME_DAY_NIGHT,
    NURSING_TIME_NIGHT
];

const GENDER = [
    GENDER_MALE,
    GENDER_FEMALE
];

const DEPENDENT_LEVEL = [
    //DEPENDENT_LEVEL_DEPENDENT,
    //DEPENDENT_LEVEL_PARTIALLY_INDEPENDENT,
    //DEPENDENT_LEVEL_INDEPENDENT
    DEPENDENT_LEVEL_1,
    DEPENDENT_LEVEL_2,
    DEPENDENT_LEVEL_3
];


module.exports = function (sequelize, DataTypes) {
    let Service = sequelize.define("service", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: DataTypes.ENUM,
            values: [STATUS_ACTIVE, STATUS_INACTIVE],
            defaultValue: STATUS_INACTIVE,
            comment: '状态'
        },
        dependentLevel: {
            type: DataTypes.ENUM,
            values: DEPENDENT_LEVEL,
            allowNull: false,
            unique: 'unique_service',
            comment: '护理等级'
        },
        patientGender: {
            type: DataTypes.ENUM,
            values: GENDER,
            allowNull: false,
            unique: 'unique_service',
            comment: '病人性别'
        },
        nursingTime: {
            type: DataTypes.ENUM,
            values: NURSING_TIME,
            allowNull: false,
            unique: 'unique_service',
            comment: '护理时间'
        },
        state: {
            type: DataTypes.STRING,
            notNull: true,
            comment: '省'
        },
        city: {
            type: DataTypes.STRING,
            notNull: true,
            comment: '市'
        },
        region: {
            type: DataTypes.STRING,
            comment: '区'
        }
    }, {
        comment: '护理服务表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false,
        indexes: [
            {
                name: 'index_service',
                fields: ['status', 'dependentLevel', 'patientGender', 'nursingTime', 'state', 'city', 'region']
            }
        ]
    });
    //类方法
    Service.queryById = function (id) {
        return Service.findOne({
            where: {
                id: id
            }
        })
    };
    Service.associate = function (models) {
        Service.belongsTo(models.work, {
            foreignKey: {
                unique: "unique_service",
                comment: "护工id"
            }
        });
        Service.belongsTo(models.hospital, {
                // foreignKey: {
                    //     unique: 'unique_hospital',
                    //     comment: '医院id'
                    // }//更改，每家医院可以对应多个护工
                foreignKey: {
                    comment: '医院id'
                }
        });
    };
    Service.acceptOrder = function (workId) {
        return Service.update(
            {
                status: Service.STATUS_ACTIVE
            },
            {
                where: {
                    workId: workId
                }
            });
    };
    Service.rejectOrder = function (workId) {
        return Service.update(
            {
                status: Service.STATUS_INACTIVE
            },
            {
                where: {
                    workId: workId
                }
            });
    };
    Service.deleteAndCreate = function (workId, services) {
        return sequelize.transaction(function (t) {
            return Service.destroy({
                where: {
                    workId: workId
                },
                transaction: t
            }).then(function (records) {
                return Service.bulkCreate(services, {transaction: t});
            });
        });
    };
    //hugo 计算服务天数
    Service.calcServiceDay = function (startDate, endDate, nursingTime) {
        let moment = require('moment');
        let nowDate = Date.now();
        let now = moment.tz(nowDate, "Asia/Shanghai");
        let start = moment.tz(startDate, "Asia/Shanghai");
        let dateUtils = require('../utils/dateUtils');
        let daysBeforeStart = dateUtils.daysBetween(nowDate, startDate) + 1;
        let serviceDays = dateUtils.daysBetween(startDate, endDate) + 1;
        let co = require('co');
        let Settings = require('../utils/settings');
        return co(function*() {

            let serviceConfig = yield Settings.getServiceConfig();

            if (daysBeforeStart < serviceConfig.minDaysBeforeStart || daysBeforeStart > serviceConfig.maxDaysBeforeStart) {
                return 0;
            }

            if (serviceDays < serviceConfig.minServiceDays || serviceDays > serviceConfig.maxServiceDays) {
                return 0;
            }

            if (start.isSame(now, 'd')) {
                switch (nursingTime) {
                    case NURSING_TIME_DAY:
                    {
                        //hugo 修改白天护工如果中午12点之后按0.5天计算
                        if (now.hours() >= 12) {
                            serviceDays -= 0.5;
                        }
                        break;
                    }
                    case NURSING_TIME_NIGHT:
                    {
                        //hugo 修改晚上护工如果下午9点之后按0.5天计算
                        if (now.hours() >= 21) {
                            serviceDays -= 0.5;
                        }
                        break;
                    }
                    case NURSING_TIME_DAY_NIGHT:
                    {
                        //hugo 修改全天护工如果中午18点之后下单按0.5天计算
                        if (now.hours() >= 18) {
                            serviceDays -= 0.5;
                        }
                        break;
                    }
                }
            }
            return serviceDays;
        });
    };

    //实例方法
    Service.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        values.services_id = values.id;
        let excludeValue = ['id','ctime', 'utime', 'dtime'];
        values = _.omit(values, excludeValue);
        return values;
    }
    Service.STATUS_ACTIVE = STATUS_ACTIVE;
    Service.STATUS_INACTIVE = STATUS_INACTIVE;
    //Service.DEPENDENT_LEVEL_INDEPENDENT = DEPENDENT_LEVEL_INDEPENDENT;
    //Service.DEPENDENT_LEVEL_DEPENDENT = DEPENDENT_LEVEL_DEPENDENT;
    //Service.DEPENDENT_LEVEL_PARTIALLY_INDEPENDENT = DEPENDENT_LEVEL_PARTIALLY_INDEPENDENT;
    Service.DEPENDENT_LEVEL_1 = DEPENDENT_LEVEL_1;
    Service.DEPENDENT_LEVEL_2 = DEPENDENT_LEVEL_2;
    Service.DEPENDENT_LEVEL_3 = DEPENDENT_LEVEL_3;
    Service.GENDER_MALE = GENDER_MALE;
    Service.GENDER_FEMALE = GENDER_FEMALE;
    Service.NURSING_TIME_DAY = NURSING_TIME_DAY;
    Service.NURSING_TIME_DAY_NIGHT = NURSING_TIME_DAY_NIGHT;
    Service.NURSING_TIME_NIGHT = NURSING_TIME_NIGHT;

    Service.NURSING_TIME = NURSING_TIME;
    Service.STATUS = STATUS;
    Service.DEPENDENT_LEVEL = DEPENDENT_LEVEL;
    Service.GENDER = GENDER;

    return Service;
};