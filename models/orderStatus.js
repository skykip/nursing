"use strict";
const moment = require('moment');
const STATUS_UNPAID = 'unpaid';
const STATUS_PAID = 'paid';
const STATUS_ASSIGNED = 'assigned';
const STATUS_SIGNED = 'signed';
const STATUS_PROGRESSING = 'progressing';
const STATUS_COMPLETED = 'completed';

const STATUS_CANCEL_PENDING = 'cancel-pending';
const STATUS_CANCELLING = 'cancelling';
const STATUS_CANCELLED = 'cancelled';

const STATUS_REFUND_PENDING = 'refund-pending';
const STATUS_REFUNDING = 'refunding';
const STATUS_REFUNDED = 'refunded';

const STATUS_SUBSTITUTE_PENDING = 'substitute-pending';
const STATUS_SUBSTITUTING = 'substituting';
const STATUS_SUBSTITUTED = 'substituted';

const STATUS_ACCEPT = 'accept';
const STATUS_REJECT = 'reject';

const STATUS_RENEW = 'renew';

const STATUS = [
    STATUS_UNPAID,        //未支付
    STATUS_PAID,          //已支付
    STATUS_ASSIGNED,      //派单中
    STATUS_SIGNED,        //已确定
    STATUS_PROGRESSING,   //进行中
    STATUS_COMPLETED,     //已完成

    STATUS_CANCEL_PENDING,     //退款中
    STATUS_CANCELLING,   //协商中
    STATUS_CANCELLED,     //已取消

    STATUS_REFUND_PENDING,   //退款待处理
    STATUS_REFUNDING,        //退款中
    STATUS_REFUNDED,         //已退款

    STATUS_SUBSTITUTE_PENDING,    //换人待处理
    STATUS_SUBSTITUTING,          //换人中
    STATUS_SUBSTITUTED,           //已换人
    
    STATUS_ACCEPT,        //已接受
    STATUS_REJECT,        //已拒绝

    STATUS_RENEW          //被续单
];

module.exports = function (sequelize, DataTypes) {
    const OrderStatus = sequelize.define("orderStatus", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: STATUS,
            comment: '状态'
        },
        changedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: '改变时间'
        }
    }, {
        comment: '订单状态表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false,
        indexes: [
            {
                fields: ['status']
            }
        ]
    });
    //类方法
    OrderStatus.associate = function (models) {
        OrderStatus.belongsTo(models.user, {
            foreignKey: {
                comment: '用户id'
            }
        });
        OrderStatus.belongsTo(models.order, {
            foreignKey: {
                comment: '订单id'
            }
        });
    };
    OrderStatus.queryByOrderId = function (orderId) {
        let User = sequelize.model('user');
        return OrderStatus.findAll({
            where: {
                orderId: orderId
            },
            include: [
                {
                    model: User
                }
            ],
            order: [['ctime', 'DESC']]
        })
    };
    OrderStatus.logStatus = function(orderId, status, userId) {
        userId = userId || 1;
        return OrderStatus.create({
            status: status,
            orderId: orderId,
            userId: userId
        });
    };
    //实例方法
    OrderStatus.prototype.toJSON = function () {
        
        let _ = require('lodash');
        let values = this.dataValues;
        values.createdAt = moment(values.createdAt).format('YYYY-MM-DD HH:mm:ss');
        values.changedAt = moment(values.changedAt).format('YYYY-MM-DD HH:mm:ss');
        
        // co(function *() {

        //     yield 
        // });
        let excludeValue = ['ctime', 'utime', 'dtime'];
        values = _.omit(values, excludeValue);
        return values;
    };

    OrderStatus.STATUS_UNPAID = STATUS_UNPAID;
    OrderStatus.STATUS_PAID = STATUS_PAID;
    OrderStatus.STATUS_ASSIGNED = STATUS_ASSIGNED;
    OrderStatus.STATUS_SIGNED = STATUS_SIGNED;
    OrderStatus.STATUS_PROGRESSING = STATUS_PROGRESSING;
    OrderStatus.STATUS_COMPLETED = STATUS_COMPLETED;
    
    OrderStatus.STATUS_CANCEL_PENDING = STATUS_CANCEL_PENDING;
    OrderStatus.STATUS_CANCELLING = STATUS_CANCELLING;
    OrderStatus.STATUS_CANCELLED = STATUS_CANCELLED;
    
    OrderStatus.STATUS_REFUND_PENDING = STATUS_REFUND_PENDING;
    OrderStatus.STATUS_REFUNDING = STATUS_REFUNDING;
    OrderStatus.STATUS_REFUNDED = STATUS_REFUNDED;    
    
    OrderStatus.STATUS_SUBSTITUTE_PENDING = STATUS_SUBSTITUTE_PENDING;
    OrderStatus.STATUS_SUBSTITUTING = STATUS_SUBSTITUTING;
    OrderStatus.STATUS_SUBSTITUTED = STATUS_SUBSTITUTED;

    OrderStatus.STATUS_ACCEPT = STATUS_ACCEPT;
    OrderStatus.STATUS_REJECT = STATUS_REJECT;
    
    OrderStatus.STATUS_RENEW = STATUS_RENEW;

    OrderStatus.STATUS = STATUS;

    return OrderStatus;
};