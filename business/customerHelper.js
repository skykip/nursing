/**
 * customerHelper.js
 * Created by haroldsong on 16/5/3.
 * Copyright (c) 2016 Tencent Inc. All rights reserved.
 * Description: getCustomers
 */

var co = require('co');
var sequelize = require('sequelize');
var _ = require('lodash');
var moment = require('moment');
var Model = require('../models');
var User = Model.user;
var Worker = Model.work;
var Supervisor = Model.supervision;
var Admin = Model.admin;
var Order = Model.order;

var getCustomers = function () {
    return co(function *() {
        var workers = yield Worker.findAll({
            where: {
                userId: {
                    $ne: null
                }
            }
        });
        var supervisors = yield Supervisor.findAll({
            where: {
                userId: {
                    $ne: null
                }
            }
        });
        var admins = yield Admin.findAll({
            where: {
                userId: {
                    $ne: null
                }
            }
        });
        var uids = [].concat(_.map(workers, function(worker) { if(worker.userId) return worker.userId; }),
            _.map(supervisors, function(supervisor) { if(supervisor.userId) return supervisor.userId; }),
            _.map(admins, function(admin) { if(admin.userId) return admin.userId; }), [1]);

        var orders = yield Order.findAll({
            attributes:[
                [sequelize.fn('SUM', sequelize.col('price')), 'totalPrice'],
                [sequelize.fn('COUNT', sequelize.col('tradeNum')), 'orderCount']
            ],
            include: [
                {
                    model: User,
                    as: 'customer',
                    paranoid: false
                }
            ],
            where: {
                status: Order.STATUS_COMPLETED
            },
            group: ['customerId']
        });

        var result = [];
        for (var i = 0; i < orders.length; ++i) {
            uids.push(orders[i].customer.id);
            result.push({
                customer: orders[i].customer,
                totalPrice: orders[i].dataValues.totalPrice,
                orderCount: orders[i].dataValues.orderCount
            })
        }

        var customers = yield User.findAll({
            where: {
                id: {
                    notIn: uids
                }
            },
            order: [
                ['ctime', 'DESC']
            ]
        });

        for (var j = 0; j < customers.length; ++j) {
            result.push({
                customer: customers[j],
                totalPrice: 0,
                orderCount: 0
            })
        }

        return result;

    }).catch(function(err) {
        console.log(err);
    });
};

exports.getCustomers = getCustomers;