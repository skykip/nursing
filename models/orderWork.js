"use strict";
const STATUS_IDLE = 'idle';
const STATUS_ACCEPT = 'accept';
const STATUS_REJECT = 'reject';

const STATUS = [
    STATUS_IDLE,
    STATUS_ACCEPT,
    STATUS_REJECT
];
const moment = require('moment');
module.exports = function (sequelize, DataTypes) {
    const OrderWork = sequelize.define("orderWork", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: STATUS,
            defaultValue: STATUS_IDLE,
            comment: '状态'
        }
    }, {
        comment: '订单护工表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false,
        indexes: [
            {
                fields: ['status']
            },
            {
                fields: ['workId', 'status']
            }
        ]
    });

    //类方法
    OrderWork.associate = function (models) {
        OrderWork.belongsTo(models.work, {
            foreignKey: {
                comment: '护工id'
            }
        });
        OrderWork.belongsTo(models.order, {
            foreignKey: {
                comment: '订单id'
            }
        });
    };
    OrderWork.invite = function (orderId, workId) {
        return OrderWork.create({
            workId: workId,
            orderId: orderId,
            status: STATUS_IDLE
        });
    };
    OrderWork.assign = function (orderId, workId) {
        return OrderWork.create({
            workId: workId,
            orderId: orderId,
            status: STATUS_ACCEPT
        })
    };
    OrderWork.queryById = function (orderWorkId) {
        let User = sequelize.model('user');
        let Hospital = sequelize.model('hospital');
        let Order = sequelize.model('order');
        let Work = sequelize.model('work');
        return OrderWork.findOne({
            where: {
                id: orderWorkId
            },
            include: [{
                model: Order,
                include: [
                    {
                        model: User,
                        as: 'customer'
                    },
                    {
                        model: User,
                        as: 'payer'
                    },
                    {
                        model: Hospital
                    },
                    {
                        model: Work
                    }
                ]
            }]
        });
    };
    OrderWork.queryAll = function (workIds, statuses) {
        workIds = [].concat(workIds || []);
        statuses = [].concat(statuses || STATUS);
        let whereClause = {
            workId: {
                in: workIds
            },
            status: {
                in: statuses
            }
        };
        if (!workIds.length) {
            delete whereClause.workId;
        }
        if (!statuses.length) {
            delete whereClause.status;
        }
        let User = sequelize.model('user');
        let Order = sequelize.model('order');
        let Work = sequelize.model('work');
        let Hospital = sequelize.model('hospital');
        return OrderWork.findAll({
            where: whereClause,
            include: [
                {
                model: Order,
                where: {
                    status: {
                        in: [Order.STATUS_UNPAID, Order.STATUS_PAID]
                    }
                },
                include: [
                    {
                        model: User,
                        as: 'customer'
                    },
                    {
                        model: User,
                        as: 'payer'
                    },
                    {
                        model: Hospital
                    },
                    {
                        model: Work
                    }
                ]
            }]
        });
    };
    // //查询当前护工的接单情况
    // OrderWork.queryOrderByWorkId = function (workId) {
    //     workIds = [].concat(workIds || []);
    //     statuses = [].concat(statuses || STATUS);
    //     let whereClause = {
    //         workId: {
    //             in: workIds
    //         },
    //         status: {
    //             in: statuses
    //         }
    //     };
    //     if (!workIds.length) {
    //         delete whereClause.workId;
    //     }
    //     if (!statuses.length) {
    //         delete whereClause.status;
    //     }
    //     let User = sequelize.model('user');
    //     let Order = sequelize.model('order');
    //     let Work = sequelize.model('work');
    //     let Hospital = sequelize.model('hospital');
    //     return OrderWork.findAll({
    //         where: whereClause,
    //         include: [
    //             {
    //             model: Order,
    //             where: {
    //                 status: {
    //                     in: [Order.STATUS_UNPAID, Order.STATUS_PAID]
    //                 }
    //             },
    //             include: [
    //                 {
    //                     model: User,
    //                     as: 'customer'
    //                 },
    //                 {
    //                     model: User,
    //                     as: 'payer'
    //                 },
    //                 {
    //                     model: Hospital
    //                 },
    //                 {
    //                     model: Work
    //                 }
    //             ]
    //         }]
    //     });
    // };
    OrderWork.queryByOrderId = function (orderId) {
        let Order = sequelize.model('order');
        let Work = sequelize.model('work');
        return OrderWork.findOne({
            where: {
                orderId: orderId,
                status: OrderWork.STATUS_IDLE
            },
            include: [
                {
                    model: Work
                }
            ]
        });
    };

    //实例方法
    OrderWork.prototype.acceptOrder = function () {
        let Order = sequelize.model('order');
        let self = this;
        return sequelize.transaction(function (t) {
            return OrderWork.update({
                status: STATUS_ACCEPT
            }, {
                where: {
                    id: self.id,
                    status: STATUS_IDLE
                },
                transaction: t
            }).then(function (result) {
                if (!result[0]) {
                    throw new Error();
                }
                return OrderWork.update({
                    status: STATUS_REJECT
                }, {
                    where: {
                        orderId: self.orderId,
                        id: {
                            $ne: self.id
                        }
                    },
                    transaction: t
                })
            }).then(function (result) {
                return Order.update({
                    workId: self.workId
                }, {
                    where: {
                        id: self.orderId
                    },
                    transaction: t
                });
            }).then(function (result) {
                return !!result[0];
            });
        });
    };

    OrderWork.prototype.rejectOrder = function () {
        let Order = sequelize.model('order');
        let self = this;
        return sequelize.transaction(function (t) {
            return OrderWork.update({
                status: STATUS_REJECT
            }, {
                where: {
                    id: self.id,
                    status: STATUS_IDLE
                },
                transaction: t
            }).then(function (result) {
                return !!result[0];
            });
        });
    };
    OrderWork.prototype.toJSON = function () {
        let Order = sequelize.model('order');
        let values = this.dataValues;
        let fields = [
            "workId",
            "status",
            "orderWork_id"
        ];
        if (this.dataValues.order) {
            fields.push('order');
        } else {
            fields.push('orderId');
        };
        // if (this.dataValues.work) {
        //     fields.push('work');
        // } else {
        //     fields.push('workId');
        // }
        values.orderWork_id = values.id;

        let _ = require('lodash');
        values = _.pick(values, fields);
        return values;
    };

    OrderWork.STATUS_IDLE = STATUS_IDLE;
    OrderWork.STATUS_ACCEPT = STATUS_ACCEPT;
    OrderWork.STATUS_REJECT = STATUS_REJECT;
    OrderWork.STATUS = STATUS;
    return OrderWork;
}
;