"use strict";
const STATUS_REVIEW = 'review';
const STATUS_GRANT = 'grant';
const STATUS_EXCEPTION = 'exception';
const STATUS_CONFIRM = 'confirm';
const STATUS_PROCESSING = "processing";
const STATUS_SUCCESS = "success";
const STATUS_FAIL = "fail";

const STATUS = [
    STATUS_REVIEW,
    STATUS_GRANT,
    STATUS_EXCEPTION,
    STATUS_CONFIRM,
    STATUS_PROCESSING,
    STATUS_SUCCESS,
    STATUS_FAIL
];

module.exports = function (sequelize, DataTypes) {
    const Salary = sequelize.define("salary", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: '工资结算开始时间'
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: '工资结算结束时间'
        },
        salary: {
            type: DataTypes.FLOAT,
            allowNull: false,
            comment: '工资金额'
        },
        realWage: {
            type: DataTypes.FLOAT,
            allowNull: false,
            comment: '实际发放工资'
        },
        otherTax: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: '各种扣税的json串'
        },
        commision: {
            type: DataTypes.FLOAT,
            allowNull: false,
            comment: '分成'
        },
        orderCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '有效订单数'
        },
        orderList: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: '订单编号数组串'
        },
        status: {
            type: DataTypes.ENUM,
            values: STATUS,
            comment: '状态'
        },
        reviewTime: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '审核时间'
        },
        grantTime: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '发放时间'
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: '异常状态原因描述'
        }
    }, {
        comment: '工资表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: true
    });
    //类方法
    Salary.associate = function (models) {
        Salary.belongsTo(models.work);
        Salary.belongsTo(models.user, {as: 'reviewer'});
        Salary.belongsTo(models.user, {as: 'granter'});
        Salary.belongsToMany(models.transfer, {
            'through': {
                model: models.salaryTransfer
            }
        });
        models.transfer.belongsToMany(models.salary, {
            'through': {
                model: models.salaryTransfer
            }
        });
    };
    Salary.queryById = function (id) {
        let Worker = sequelize.model('work');
        let User = sequelize.model('user');
        return Salary.find({
            where: {
                id: id
            },
            include: [
                {
                    model: Worker,
                    paranoid: false
                },
                {
                    model: User,
                    as: 'reviewer',
                    paranoid: false
                },
                {
                    model: User,
                    as: 'granter',
                    paranoid: false
                }
            ]
        });
    };
    Salary.queryByWorkerId = function (workerId) {
        return Salary.findAll({
            where: {
                workId: workerId
            }
        });
    };
    Salary.queryByStatus = function (status, workerType) {
        let Worker = sequelize.model('work');
        let User = sequelize.model('user');
        let Transfer = sequelize.model('transfer');
        return Salary.findAll({
            where: {
                status:{
                    in: status
                }
            },
            include: [
                {
                    model: Worker,
                    where: {
                        workType: workerType
                    },
                    paranoid: false
                },
                {
                    model: User,
                    as: 'reviewer',
                    paranoid: false
                },
                {
                    model: User,
                    as: 'granter',
                    paranoid: false
                },
                {
                    model: Transfer
                }
            ]
        });
    };
    Salary.saveNewSalaries = function (salaries) {
        return sequelize.transaction(function (t) {
            return Salary.destroy({
                force: true,
                where: {
                    startDate: salaries[0].startDate,
                    endDate: salaries[0].endDate
                },
                transaction: t
            }).then(function (records) {
                return Salary.bulkCreate(salaries, {transaction: t});
            });
        });
    };
    Salary.updateStatus = function(ids, status, userId, time, description) {
        return sequelize.transaction(function (t) {
            return Salary.update(
                {
                    status: status,
                    granterId: userId,
                    grantTime: time,
                    description: description
                },
                {
                    where: {
                        id: {
                            in: ids
                        }
                    },
                    transaction: t
                });
        });
    };
    //实例方法
    Salary.prototype.toJSON = function () {
        let fields = [
            "id",
            "startDate",
            "endDate",
            "salary",
            "realWage",
            "otherTax",
            "commision",
            "orderCount",
            "orderList",
            "status",
            "reviewTime",
            "grantTime",
            "description",
            "work",
            "reviewer",
            "granter"
        ];
        let _ = require('lodash');
        let values = this.dataValues;
        values = _.pick(values, fields);
        if (this.transfers && this.transfers.length && this.status === STATUS_FAIL) {
            values.reason = this.transfers[0].reason;
        }
        return values;
    };
   

    Salary.STATUS_REVIEW = STATUS_REVIEW;
    Salary.STATUS_GRANT = STATUS_GRANT;
    Salary.STATUS_EXCEPTION = STATUS_EXCEPTION;
    Salary.STATUS_CONFIRM = STATUS_CONFIRM;
    Salary.STATUS_PROCESSING = STATUS_PROCESSING;
    Salary.STATUS_FAIL = STATUS_FAIL;
    Salary.STATUS_SUCCESS = STATUS_SUCCESS;
    Salary.STATUS = STATUS;

    return Salary;
};