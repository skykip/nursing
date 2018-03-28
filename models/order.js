"use strict";
const _ = require('lodash');
const moment = require('moment');
const co = require('co');

//护理等级
const DEPENDENT_LEVEL = [
    'level1',
    'level2',
    'level3'
];
//用户姓别
const GENDER = [
    'male',
    'female'
];
//护理时间
const NURSING_TIME = [
    'day',
    'dayNight',
    'night'
];

/* 订单状态 */

// 未付款-有效
const STATUS_UNPAID = 'unpaid';
// 已付款-有效
const STATUS_PAID = 'paid';
// 已签约
const STATUS_SIGNED = 'signed';
// 进行中-有效
const STATUS_PROGRESSING = 'progressing';
// 已完成-有效
const STATUS_COMPLETED = 'completed';

// 取消-待处理
const STATUS_CANCEL_PENDING = "cancel-pending";
// 取消-进行中
const STATUS_CANCELLING = "cancelling";
// 取消-已完成
const STATUS_CANCELLED = "cancelled";

// 退款-待处理
const STATUS_REFUND_PENDING = "refund-pending";
// 退款-进行中-有效
const STATUS_REFUNDING = "refunding";
// 退款-已完成-有效
const STATUS_REFUNDED = "refunded";


// 换人-待处理
const STATUS_SUBSTITUTE_PENDING = "substitute-pending";
// 换人-进行中
const STATUS_SUBSTITUTING = "substituting";
// 换人-已完结
const STATUS_SUBSTITUTED = "substituted";

//投诉-进行中
const STATUS_COMPLAINTS = "complaints";
//投诉-已完结
const STATUS_COMPLAINTSOUT = "complaints-out";

//订单状态
const STATUS = [
    STATUS_UNPAID, //未付款
    STATUS_PAID,   //
    STATUS_SIGNED,
    STATUS_PROGRESSING,
    STATUS_COMPLETED,

    STATUS_CANCEL_PENDING,
    STATUS_CANCELLING,
    STATUS_CANCELLED,

    STATUS_REFUND_PENDING,
    STATUS_REFUNDING,
    STATUS_REFUNDED,

    STATUS_SUBSTITUTE_PENDING,
    STATUS_SUBSTITUTING,
    STATUS_SUBSTITUTED,

    STATUS_COMPLAINTS,
    STATUS_COMPLAINTSOUT
];
const STATUSES_REFUNDABLE = [
    STATUS_PAID,
    STATUS_SIGNED,
    STATUS_PROGRESSING
];

const STATUSES_CANCELABLE = [
    STATUS_UNPAID
];
const STATUSES_STARTABLE = [
    STATUS_PAID,
    STATUS_SIGNED,
];

const STATUSES_SUBSTITUTABLE = [
    STATUS_PROGRESSING
];

const STATUSES_PENDING = [
    STATUS_CANCEL_PENDING,
    STATUS_REFUND_PENDING,
    STATUS_SUBSTITUTE_PENDING
];

const STATUSES_WORKER_RELEASABLE = [
    STATUS_COMPLETED,
    STATUS_REFUNDING,
    STATUS_REFUNDED,
    STATUS_CANCELLING,
    STATUS_CANCELLED,
    STATUS_SUBSTITUTING,
    STATUS_SUBSTITUTED
];

module.exports = function (sequelize, DataTypes) {
    const Order = sequelize.define("order", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tradeNum: {
            type: DataTypes.STRING(100),
            unique: {
                msg: 'Trade number should be unique'
            },
            comment: '订单号'
        },
        status: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: STATUS,
            defaultValue: STATUS_UNPAID,
            comment: '订单状态'
        },
        patientGender: {
            type: DataTypes.ENUM,
            values: GENDER,
            allowNull: false,
            comment: '病人性别'
        },
        workerGender: {
            type: DataTypes.ENUM,
            values: GENDER,
            allowNull: false,
            comment: '护工性别'
        },
        dependentLevel: {
            type: DataTypes.ENUM,
            values: DEPENDENT_LEVEL,
            allowNull: false,
            comment: '护理等级'
        },
        nursingTime: {
            type: DataTypes.ENUM,
            values: NURSING_TIME,
            allowNull: false,
            comment: '护理时间'
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: '开始时间'
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: '结束时间'
        },
        actualStartDate: {
            type: DataTypes.DATE,
            //allowNull: false,//改
            comment: '实际开始时间'
        },
        actualEndDate: {
            type: DataTypes.DATE,
            //allowNull: false,//改
            comment: '实际结束时间'
        },
        msg: {
            type: DataTypes.TEXT,
            comment: '备注'
        },
        description: {
            type: DataTypes.TEXT,
            comment: '描述'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            validate: { min: 0 },
            comment: '实际结算金额'
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            validate: { min: 0 },
            comment: '价格'
        },
        dayPrice: {
            type: DataTypes.DECIMAL(10, 2),
            validate: { min: 0 },
            comment: '日单价'
        },
        place: {
            type: DataTypes.STRING,
            comment: '病房号'
        },
        contract: {
            type: DataTypes.STRING,
            comment: '合同照片'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: '下单时间'
        }
    }, {
            comment: '订单表',
            engine: "InnoDB ROW_FORMAT = DYNAMIC",
            rowFormat: "DYNAMIC",
            createdAt: 'ctime',
            updatedAt: 'utime',
            deletedAt: 'dtime',
            paranoid: true,
            indexes: [
                {
                    fields: ['tradeNum']
                },
                {
                    fields: ['status']
                }
            ]
        });
    //建立外键关系
    Order.associate = function (models) {
        Order.hasMany(models.orderWork); //一对多关系,一个订单有多条更改护工状态
        Order.hasMany(models.orderStatus);//一对多关系,一个订单有多条更改状态
        Order.hasOne(models.orderRating);  //1对1关系，一个订单有一个评论
        Order.belongsTo(models.work);
        Order.belongsTo(models.hospital);
        Order.belongsTo(models.user, { as: 'customer' });
        Order.belongsTo(models.user, { as: 'payer' });
        //Order.hasMany(models.checkIn);
        Order.belongsToMany(models.payment, {
            'through': {
                model: models.orderPayment
                }
                });
        // Order.belongsToMany(models.payment, {
        //     'through': {
        //         model: models.orderRefund
        //         }
        //      });
    };
    //查询所有订单列表######yzl admin
    Order.queryAllOrders =  function (options) {
        let Hospital = sequelize.model('hospital');
        let User = sequelize.model('user');
        let Work = sequelize.model('work');
        let OrderWork = sequelize.model('orderWork');
        let OrderStatus = sequelize.model('orderStatus');
        let Service = sequelize.model('service');
       // let CheckIn = sequelize.model('checkIn');
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;

        let customerName = options.query.customerName;//模糊查询
        let workName = options.query.workName ;//模糊查询
        let tradeNum = options.query.tradeNum ;//模糊查询
        let startDate = options.query.startDate ;
        let endDate = options.query.endDate;
        let status = options.query.status ;
        let hospitalId = options.query.hospitalId ;
        let dependentLevel = options.query.dependentLevel ;
        let nursingTime = options.query.nursingTime ;
        let state = options.query.state ;
        let city = options.query.city ;
        let region = options.query.region ;

        
        //################order参数
        let whereClause = {};
        if (tradeNum && tradeNum.length) {
            whereClause.tradeNum = {
                '$like': '%'+tradeNum+'%'
            }
        };
        //开始时间要设置为这一天的00：00
        if(startDate && startDate.length){
        startDate =  moment(startDate[0]);
        if (startDate) {
            whereClause.startDate = {
                '$gte': startDate
            }
        };
    };
        if(endDate && endDate.length){
        //结束时间要加一天，要不然结束时间那一天的订单查不到
        endDate =  moment(endDate[0]).add(1,'days');
        if (endDate) {
            whereClause.endDate = {
                '$lte': endDate
            }
        };
    };

        if (status && status.length) {
            whereClause.status = {
                in: status
            }
        };
        if (hospitalId && hospitalId.length) {
            whereClause.hospitalId = {
                in: hospitalId
            }
        };
        if (dependentLevel && dependentLevel.length) {
            whereClause.dependentLevel = {
                in: dependentLevel
            }
        };
        if (nursingTime && nursingTime.length) {
            whereClause.nursingTime = {
                in: nursingTime
            }
        };
    
        //################user参数
        let userWhereClause = null;
        if (customerName && customerName.length) {
            userWhereClause= {
                name:{'$like': '%'+customerName+'%'}
            }
        };
        //################work参数
        let workWhereClause = null;
        if (workName && workName.length) {
            workWhereClause= {
                name:{'$like': '%'+workName+'%'}
            }
        };
        //################service参数
        // let serviceWhereClause = {};
        // if (state && state.length) {
        //     serviceWhereClause.state = {
        //         in: state
        //     }
        // };
        // if (city && city.length) {
        //     serviceWhereClause.city = {
        //         in: city
        //     }
        // };
        // if (region && region.length) {
        //     serviceWhereClause.region = {
        //         in: region
        //     }
        // };
        // //如果serviceWhereClause为空对象{}，则置为null
        // if(JSON.stringify(serviceWhereClause) == "{}"){
        //     serviceWhereClause=null;
        // };
        //################hospital参数
        let hospitalWhereClause = {};
        if (state && state.length) {
            hospitalWhereClause.state = {
                in: state
            }
        };
        if (city && city.length) {
            hospitalWhereClause.city = {
                in: city
            }
        };
        if (region && region.length) {
            hospitalWhereClause.region = {
                in: region
            }
        };
        //如果serviceWhereClause为空对象{}，则置为null
        if(JSON.stringify(hospitalWhereClause) == "{}"){
            hospitalWhereClause=null;
        };
        
        return Order.findAll({
            include: [
                {
                    model: Work,
                    where:workWhereClause,
                    paranoid: false,
                    // include:[
                    //     {
                    //         model:Service,
                    //         paranoid: false,
                    //         where:serviceWhereClause
                    //     },
                    // ]
                },
                {
                    model: Hospital,
                    paranoid: false,
                    where:hospitalWhereClause
                },
                {
                    model: User,
                    as: 'customer',
                    where:userWhereClause,
                    paranoid: false
                },
                {
                    model: User,
                    as: 'payer',
                    paranoid: false
                },
                {
                    model: OrderWork,
                    as: 'orderWorks',
                    include: [
                        {
                            model: Work,
                            paranoid: false
                        }
                    ]
                },
                {
                    model: OrderStatus,
                    paranoid: false,
                    include: [
                        {
                            model: User
                        }
                    ]
                },
                // {
                //     model: CheckIn,
                //     paranoid: false
                // }

            ],
            where: whereClause,
            limit: limit,
            offset: offset,
            // order: sort.concat(
            //     [
            //         [OrderStatus, 'id', 'ASC'],
            //         [CheckIn, 'date', 'DESC']
            //     ]
            // )
        });
    };


        //查询所有订单列表######yzl admin
    Order.queryAllOrders =  function (options) {
        let Hospital = sequelize.model('hospital');
        let User = sequelize.model('user');
        let Work = sequelize.model('work');
        let OrderWork = sequelize.model('orderWork');
        let OrderStatus = sequelize.model('orderStatus');
        let Service = sequelize.model('service');
       // let CheckIn = sequelize.model('checkIn');
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;

        let customerName = options.query.customerName;//模糊查询
        let workName = options.query.workName ;//模糊查询
        let tradeNum = options.query.tradeNum ;//模糊查询
        let startDate = options.query.startDate ;
        let endDate = options.query.endDate;
        let status = options.query.status ;
        let hospitalId = options.query.hospitalId ;
        let dependentLevel = options.query.dependentLevel ;
        let nursingTime = options.query.nursingTime ;
        let state = options.query.state ;
        let city = options.query.city ;
        let region = options.query.region ;

        
        //################order参数
        let whereClause = {};
        if (tradeNum && tradeNum.length) {
            whereClause.tradeNum = {
                '$like': '%'+tradeNum+'%'
            }
        };
        //开始时间要设置为这一天的00：00
        if(startDate && startDate.length){
        startDate =  moment(startDate[0]);
        if (startDate) {
            whereClause.startDate = {
                '$gte': startDate
            }
        };
    };
        if(endDate && endDate.length){
        //结束时间要加一天，要不然结束时间那一天的订单查不到
        endDate =  moment(endDate[0]).add(1,'days');
        if (endDate) {
            whereClause.endDate = {
                '$lte': endDate
            }
        };
    };

        if (status && status.length) {
            whereClause.status = {
                in: status
            }
        };
        if (hospitalId && hospitalId.length) {
            whereClause.hospitalId = {
                in: hospitalId
            }
        };
        if (dependentLevel && dependentLevel.length) {
            whereClause.dependentLevel = {
                in: dependentLevel
            }
        };
        if (nursingTime && nursingTime.length) {
            whereClause.nursingTime = {
                in: nursingTime
            }
        };
    
        //################user参数
        let userWhereClause = null;
        if (customerName && customerName.length) {
            userWhereClause= {
                name:{'$like': '%'+customerName+'%'}
            }
        };
        //################work参数
        let workWhereClause = null;
        if (workName && workName.length) {
            workWhereClause= {
                name:{'$like': '%'+workName+'%'}
            }
        };
        //################service参数
        // let serviceWhereClause = {};
        // if (state && state.length) {
        //     serviceWhereClause.state = {
        //         in: state
        //     }
        // };
        // if (city && city.length) {
        //     serviceWhereClause.city = {
        //         in: city
        //     }
        // };
        // if (region && region.length) {
        //     serviceWhereClause.region = {
        //         in: region
        //     }
        // };
        // //如果serviceWhereClause为空对象{}，则置为null
        // if(JSON.stringify(serviceWhereClause) == "{}"){
        //     serviceWhereClause=null;
        // };
        //################hospital参数
        let hospitalWhereClause = {};
        if (state && state.length) {
            hospitalWhereClause.state = {
                in: state
            }
        };
        if (city && city.length) {
            hospitalWhereClause.city = {
                in: city
            }
        };
        if (region && region.length) {
            hospitalWhereClause.region = {
                in: region
            }
        };
        //如果serviceWhereClause为空对象{}，则置为null
        if(JSON.stringify(hospitalWhereClause) == "{}"){
            hospitalWhereClause=null;
        };
        
        return Order.findAll({
            include: [
                {
                    model: Work,
                    where:workWhereClause,
                    paranoid: false,
                    // include:[
                    //     {
                    //         model:Service,
                    //         paranoid: false,
                    //         where:serviceWhereClause
                    //     },
                    // ]
                },
                {
                    model: Hospital,
                    paranoid: false,
                    where:hospitalWhereClause
                },
                {
                    model: User,
                    as: 'customer',
                    where:userWhereClause,
                    paranoid: false
                },
                {
                    model: User,
                    as: 'payer',
                    paranoid: false
                },
                {
                    model: OrderWork,
                    as: 'orderWorks',
                    include: [
                        {
                            model: Work,
                            paranoid: false
                        }
                    ]
                },
                {
                    model: OrderStatus,
                    paranoid: false,
                    include: [
                        {
                            model: User
                        }
                    ]
                },
                // {
                //     model: CheckIn,
                //     paranoid: false
                // }

            ],
            where: whereClause,
            limit: limit,
            offset: offset,
            // order: sort.concat(
            //     [
            //         [OrderStatus, 'id', 'ASC'],
            //         [CheckIn, 'date', 'DESC']
            //     ]
            // )
        });
    };

    //查询所有未处理订单列表###### admin
    Order.queryAllUnprocessedOrders =  function (options) {
        let Hospital = sequelize.model('hospital');
        let User = sequelize.model('user');
        let Work = sequelize.model('work');
        let OrderWork = sequelize.model('orderWork');
        let OrderStatus = sequelize.model('orderStatus');
        let Service = sequelize.model('service');
       // let CheckIn = sequelize.model('checkIn');
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
        let minute = options.query.minute;

        if (!minute) {
            minute = 10;      //默认间隔设置为10分钟
        }


        let whereClause = {};
        let rangeTime = moment().subtract(minute, "minutes");   // 在rangeTime之前的订单就是在minute分钟数未处理订单
                 whereClause.ctime = {
                        '$lte': rangeTime
                    };
                    whereClause.status = {
                        '$eq':"idle"
                    };

       
        return OrderWork.findAndCountAll({
            include: [
                {
                        model: Order,
                        paranoid: false,
                        // where:hospitalWhereClause
                    },
 

            ],
            where: whereClause,
            limit: limit,
            offset: offset,

        });
    };




    //根据orderId查询订单######yzl admin
    Order.queryByOrderId = function (orderId) {
        let Hospital = sequelize.model('hospital');
        let User = sequelize.model('user');
        let Work = sequelize.model('work');
        let OrderWork = sequelize.model('orderWork');
        let Price = sequelize.model('price');
        let OrderStatus = sequelize.model('orderStatus');
        // let CheckIn = sequelize.model('checkIn');
        return Order.findOne({
            where: {
                id: orderId
            },
            include: [
                {
                    model: Work,
                    include: [Price],
                    paranoid: false
                },
                {
                    model: Hospital,
                    paranoid: false
                },
                {
                    model: User,
                    as: 'customer',
                    paranoid: false
                },
                {
                    model: User,
                    as: 'payer',
                    paranoid: false
                },
                {
                    model: OrderStatus,
                    paranoid: false,
                    include: [
                        {
                            model: User
                        }
                    ]
                },
                {
                    model: OrderWork,
                    as: 'orderWorks',
                    include: [
                        {
                            model: Work,
                            paranoid: false
                        }
                    ]
                },
                // {
                //     model: CheckIn,
                //     paranoid: false
                // }
            ],
            order: [
                [OrderStatus, 'id', 'ASC'],
                // [CheckIn, 'date', 'DESC']
            ]
        });
    };

    //获取用户所有已支付订单 yzl admin#####有日期比较功能
    Order.queryUserAllpaidOrder = function (userId,startDate,endDate) {
        let Hospital = sequelize.model('hospital');
        return Order.findAll({
            'attributes': [['id', 'order_id'], 'createdAt', 'status', 
                          'amount','customerId','startDate','endDate'],
            'where': [
                {
                    'customerId': { '$eq': userId }
                },
                {
                    'status': [STATUS_PROGRESSING, STATUS_COMPLAINTS, STATUS_REFUNDING,
                        STATUS_COMPLAINTSOUT, STATUS_COMPLETED,STATUS_PAID]
                }
            ],
            include: [
                {
                    model: Hospital,
                    paranoid: false,
                    attributes: ['name']
                }
            ]
        }).then(function (order) {
            var list = [];
            for (var i = 0; i < order.length; i++) {
                var obj = order[i].dataValues;
                //之前没改数据库配置前直接从数据库内读出的时间都加了八小时，为了和数据库内时间一致使用了utcOffset()
                //现在在sequelize中配置了timezone=+08:00,则默认为+8，加utcOffset(+8)或不加，效果相同
                obj.createdAt = moment(obj.createdAt).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                obj.startDate = moment(obj.startDate).utcOffset(+8).format('YYYY-MM-DD');
                obj.endDate = moment(obj.endDate).utcOffset(+8).format('YYYY-MM-DD');
                obj.startStatus = (order.status == STATUS_PAID ? 0 : 1);

                var orderStartDate=new Date(obj.startDate);
                var orderEndDate=new Date(obj.endDate);
                if(startDate.length>0&&endDate.length>0){
                    var queryStartDate=new Date(startDate);
                    var queryEndDate=new Date(endDate);
                }else{
                    var queryStartDate=new Date('1970-1-1');
                    var queryEndDate=new Date('2050-1-1');
                }
                let orderStartDateLong = Date.parse(orderStartDate);
                let orderEndDateLong = Date.parse(orderEndDate);
                let queryStartDateLong = Date.parse(queryStartDate);
                let queryEndDateLong = Date.parse(queryEndDate);

                //比较时间，在输入的时间范围内的所有已支付订单
                if(queryStartDateLong <= orderStartDateLong && 
                    queryEndDateLong >= orderEndDateLong){
                    list.push(obj);
                };
            };
            return list;
        });
    };

    //获取护工所有已支付订单 yzl admin#####无日期比较功能
    Order.queryWorkAllpaidOrder = function (workId) {
        let Hospital = sequelize.model('hospital');
        return Order.findAll({
            'attributes': [['id', 'order_id'], 'createdAt', 'status', 
                          'amount','customerId','startDate','endDate','workId'],
            'where': [
                {
                    'workId': { '$eq': workId }
                },
                {
                    'status': [STATUS_PROGRESSING, STATUS_COMPLAINTS, STATUS_REFUNDING,
                        STATUS_COMPLAINTSOUT, STATUS_COMPLETED,STATUS_PAID]
                }
            ],
            include: [
                {
                    model: Hospital,
                    paranoid: false,
                    attributes: ['name']
                }
            ]
        }).then(function (order) {
            var list = [];
            for (var i = 0; i < order.length; i++) {
                var obj = order[i].dataValues;
                //之前没改数据库配置前直接从数据库内读出的时间都加了八小时，为了和数据库内时间一致使用了utcOffset()
                //现在在sequelize中配置了timezone=+08:00,则默认为+8，加utcOffset(+8)或不加，效果相同
                obj.createdAt = moment(obj.createdAt).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                obj.startDate = moment(obj.startDate).utcOffset(+8).format('YYYY-MM-DD');
                obj.endDate = moment(obj.endDate).utcOffset(+8).format('YYYY-MM-DD');
                obj.startStatus = (order.status == STATUS_PAID ? 0 : 1);

                // var orderStartDate=new Date(obj.startDate);
                // var orderEndDate=new Date(obj.endDate);
                // if(startDate.length>0&&endDate.length>0){
                //     var queryStartDate=new Date(startDate);
                //     var queryEndDate=new Date(endDate);
                // }else{
                //     var queryStartDate=new Date('1970-1-1');
                //     var queryEndDate=new Date('2050-1-1');
                // }
                // let orderStartDateLong = Date.parse(orderStartDate);
                // let orderEndDateLong = Date.parse(orderEndDate);
                // let queryStartDateLong = Date.parse(queryStartDate);
                // let queryEndDateLong = Date.parse(queryEndDate);

                // //比较时间，在输入的时间范围内的所有已支付订单
                // if(queryStartDateLong <= orderStartDateLong && 
                //     queryEndDateLong >= orderEndDateLong){
                //     list.push(obj);
                // };
                list.push(obj);
            };
            return list;
        });
    };

    //获取用户所有完结的订单yzl admin#####有日期比对功能
    Order.queryUserAllCompletedOrder = function (userId,startDate,endDate) {
        let OrderRating = sequelize.model('orderRating');
        let Hospital = sequelize.model('hospital');
        return Order.findAll({
            'attributes': [['id', 'order_id'], 'createdAt', 'startDate','endDate',
                            'status', 'price', 'actualStartDate','actualEndDate', 'amount','customerId'],
            //逻辑：当订单状态等于退款-已完成、投诉-已完成或订单正常完成且评论不为空时
            where: [
                {
                    customerId: userId
                },
                {
                    '$or': [
                        { 'status': [STATUS_REFUNDED, STATUS_COMPLAINTSOUT, STATUS_COMPLETED, STATUS_CANCELLED] }
                    ]
                }],
            include: [
                {
                    model: Hospital,
                    paranoid: false,
                    attributes: ['name']
                },
                {
                    model: OrderRating,
                    paranoid: false
                }
            ]
        }).then(function (order) {
            var list = [];
            for (var i = 0; i < order.length; i++) {
                var obj = order[i].dataValues;
                //let moment = require('moment-timezone');
                //var London = moment(obj.createdAt,"Europe/London");
                //直接从数据库内读出的时间都加了八小时，为了和数据库内时间一致使用了utcOffset()
                obj.createdAt = moment(obj.createdAt).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                //获取订单进行时间
                obj.actualStartDate = moment(obj.actualStartDate).format('YYYY-MM-DD HH:mm:ss');
                obj.actualEndDate = moment(obj.actualEndDate).format('YYYY-MM-DD HH:mm:ss');
                var actualStartDate = moment(obj.actualStartDate);
                var actualEndDate = moment(obj.actualEndDate);
                var timeOut = actualEndDate.unix() - actualStartDate.unix();
                obj.duration = Order.TimeFormat(timeOut);

                obj.ratingStatus = (obj.orderRating == null ? 0 : 1);
                obj.startDate = moment(obj.startDate).utcOffset(+8).format('YYYY-MM-DD');
                obj.endDate = moment(obj.endDate).utcOffset(+8).format('YYYY-MM-DD');

                var orderStartDate=new Date(obj.startDate);
                var orderEndDate=new Date(obj.endDate);
                if(startDate.length>0&&endDate.length>0){
                    var queryStartDate=new Date(startDate);
                    var queryEndDate=new Date(endDate);
                }else{
                    var queryStartDate=new Date('1970-1-1');
                    var queryEndDate=new Date('2050-1-1');
                }
                let orderStartDateLong = Date.parse(orderStartDate);
                let orderEndDateLong = Date.parse(orderEndDate);
                let queryStartDateLong = Date.parse(queryStartDate);
                let queryEndDateLong = Date.parse(queryEndDate);
                //比较时间，在输入的时间范围内的所有已已完成订单
                if(queryStartDateLong <= orderStartDateLong && 
                    queryEndDateLong >= orderEndDateLong){
                    list.push(obj);
                };
            };
            return list;
        });
    };

    //获取护工所有完结的订单yzl admin#####无日期比对功能
    Order.queryWorkAllCompletedOrder = function (workId) {
        let OrderRating = sequelize.model('orderRating');
        let Hospital = sequelize.model('hospital');
        return Order.findAll({
            'attributes': [['id', 'order_id'], 'createdAt', 'startDate','endDate',
                            'status', 'price', 'actualStartDate','actualEndDate', 'amount','customerId','workId'],
            //逻辑：当订单状态等于退款-已完成、投诉-已完成或订单正常完成且评论不为空时
            where: [
                {
                    workId: workId
                },
                {
                    '$or': [
                        { 'status': [STATUS_REFUNDED, STATUS_COMPLAINTSOUT, STATUS_COMPLETED, STATUS_CANCELLED] }
                    ]
                }],
            include: [
                {
                    model: Hospital,
                    paranoid: false,
                    attributes: ['name']
                },
                {
                    model: OrderRating,
                    paranoid: false
                }
            ]
        }).then(function (order) {
            var list = [];
            for (var i = 0; i < order.length; i++) {
                var obj = order[i].dataValues;
                //let moment = require('moment-timezone');
                //var London = moment(obj.createdAt,"Europe/London");
                //直接从数据库内读出的时间都加了八小时，为了和数据库内时间一致使用了utcOffset()
                obj.createdAt = moment(obj.createdAt).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
               //获取订单进行时间
                obj.actualStartDate = moment(obj.actualStartDate).format('YYYY-MM-DD HH:mm:ss');
                obj.actualEndDate = moment(obj.actualEndDate).format('YYYY-MM-DD HH:mm:ss');
                var actualStartDate = moment(obj.actualStartDate);
                var actualEndDate = moment(obj.actualEndDate);
                var timeOut = actualEndDate.unix() - actualStartDate.unix();
                obj.duration = Order.TimeFormat(timeOut);

                obj.ratingStatus = (obj.orderRating == null ? 0 : 1);
                obj.startDate = moment(obj.startDate).utcOffset(+8).format('YYYY-MM-DD');
                obj.endDate = moment(obj.endDate).utcOffset(+8).format('YYYY-MM-DD');

                // var orderStartDate=new Date(obj.startDate);
                // var orderEndDate=new Date(obj.endDate);
                // if(startDate.length>0&&endDate.length>0){
                //     var queryStartDate=new Date(startDate);
                //     var queryEndDate=new Date(endDate);
                // }else{
                //     var queryStartDate=new Date('1970-1-1');
                //     var queryEndDate=new Date('2050-1-1');
                // }
                // let orderStartDateLong = Date.parse(orderStartDate);
                // let orderEndDateLong = Date.parse(orderEndDate);
                // let queryStartDateLong = Date.parse(queryStartDate);
                // let queryEndDateLong = Date.parse(queryEndDate);
                // //比较时间，在输入的时间范围内的所有已已完成订单
                // if(queryStartDateLong <= orderStartDateLong && 
                //     queryEndDateLong >= orderEndDateLong){
                //     list.push(obj);
                // };
                list.push(obj);
            };
            return list;
        });
    };

 //获取用户所有未开始订单
 Order.GetUserAllNotStartOrder = function (userId) {
    let Hospital = sequelize.model('hospital');
    return Order.findAll({
        'attributes': [['id', 'order_id'], 'tradeNum','createdAt', 'status', 'price'],
        'where': [
            {
                'customerId': { '$eq': userId }
            },
            {
                '$or': [
                    { 'status': { '$eq': STATUS_UNPAID } },
                    {
                        'status': { '$eq': STATUS_PAID } 
                        // '$and': [
                        //     { 'status': { '$eq': STATUS_PAID } },
                        //     { 'startDate': { '$gt': Date.now() } }
                        // ]
                        
                    },
                    {'status': { '$eq': STATUS_SIGNED }}
                ]
            }],
        include: [
            {
                model: Hospital,
                paranoid: false,
                attributes: ['name']
            }
        ]
    }).then(function (order) {
        var list = [];
        for (var i = 0; i < order.length; i++) {
            var obj = order[i].dataValues;
            obj.createdAt = moment(obj.createdAt).format('YYYY-MM-DD HH:mm:ss');
            obj.startStatus = (order.status == STATUS_PAID ? 0 : 1);
            list.push(obj);
        }
        return list;
    });
};
//获取护工所有未开始订单yzl
Order.GetWorkAllNotStartOrder = function (workId) {
    let Hospital = sequelize.model('hospital');
    let OrderWork = sequelize.model('orderWork');
    return Order.findAll({
        'attributes': [['id', 'order_id'], 'tradeNum','createdAt', 'status', 'price','startDate','endDate'],
        'where': [
            {
                'workId': { '$eq': workId }
            },
            {
                '$or': [
                    { 'status': { '$eq': STATUS_UNPAID } },
                    {
                        'status': { '$eq': STATUS_PAID } 
                        // '$and': [
                        //     { 'status': { '$eq': STATUS_PAID } },
                        //     { 'startDate': { '$gt': Date.now() } }
                        // ]
                        
                    },
                    {'status': { '$eq': STATUS_SIGNED }}
                ]
            }],
        include: [
            {
                model: Hospital,
                paranoid: false,
                attributes: ['name']
            },
            {
                model: OrderWork,
                paranoid: false,
                where:{
                    status:'accept'
                }
            }
        ]
    }).then(function (order) {
        var list = [];
        for (var i = 0; i < order.length; i++) {
            var obj = order[i].dataValues;
            obj.createdAt = moment(obj.createdAt).format('YYYY-MM-DD HH:mm:ss');
            obj.startDate = moment(obj.startDate).format('YYYY-MM-DD HH:mm:ss');
            obj.endDate = moment(obj.endDate).format('YYYY-MM-DD HH:mm:ss');
            obj.startStatus = (order.status === STATUS_PAID ? 0 : 1);
            list.push(obj);
        }
        return list;
    });
};


    //获取用户所有进行中的订单
    Order.GetUserAllProcessingOrder = function (userId) {
        let Hospital = sequelize.model('hospital');
        return Order.findAll({
            'attributes': [['id', 'order_id'], 'tradeNum','createdAt', 'status', 'price', 'actualStartDate', 'amount','customerId','workId'],
            'where': [
                {
                    'customerId': { '$eq': userId }
                },
                {
                    'status': [STATUS_PROGRESSING, STATUS_COMPLAINTS, STATUS_REFUNDING]
                }],
            include: [
                {
                    model: Hospital,
                    paranoid: false,
                    attributes: ['name']
                }
            ]
        }).then(function (order) {
            var list = [];
            for (var i = 0; i < order.length; i++) {
                var obj = order[i].dataValues;
                obj.createdAt = moment(obj.createdAt).format('YYYY-MM-DD HH:mm:ss');
                obj.actualStartDate = moment(obj.actualStartDate).format('YYYY-MM-DD HH:mm:ss');
                var receivedTime = moment(obj.actualStartDate);
                var timeOut = moment().unix() - receivedTime.unix();
                obj.duration = Order.TimeFormat(timeOut);
                list.push(obj);
            }
            return list;
        });
    };

    //获取护工所有进行中的订单yzl
    Order.GetWorkAllProcessingOrder = function (workId) {
        let Hospital = sequelize.model('hospital');
        return Order.findAll({
            'attributes': [['id', 'order_id'], 'tradeNum','createdAt', 'status', 'price', 'dayPrice','actualStartDate', 'amount','customerId','workId','startDate','endDate'],
            'where': [
                {
                    'workId': { '$eq': workId }
                },
                {
                    'status': [STATUS_PROGRESSING, STATUS_COMPLAINTS, STATUS_REFUNDING]
                }],
            include: [
                {
                    model: Hospital,
                    paranoid: false,
                    attributes: ['name']
                }
            ]
        }).then(function (order) {
            var list = [];
            for (var i = 0; i < order.length; i++) {
                var obj = order[i].dataValues;
                obj.createdAt = moment(obj.createdAt).format('YYYY-MM-DD HH:mm:ss');
                //得到从目前的时间到实际开始时间
                obj.actualStartDate = moment(obj.actualStartDate).format('YYYY-MM-DD HH:mm:ss');
                obj.startDate = moment(obj.startDate).format('YYYY-MM-DD HH:mm:ss');
                obj.endDate = moment(obj.endDate).format('YYYY-MM-DD HH:mm:ss');
                var actualStartDate = moment(obj.actualStartDate);
                var timeOut = moment().unix() - actualStartDate.unix();
                obj.duration = Order.TimeFormat(timeOut);
                list.push(obj);
            }
            return list;
        });
    };

    //获取用户所有完结的订单
    Order.GetUserAllCompletedOrder = function (userId) {
        let OrderRating = sequelize.model('orderRating');
        let Hospital = sequelize.model('hospital');
        return Order.findAll({
            'attributes': [['id', 'order_id'], 'tradeNum','createdAt', 'status', 'price', 'actualStartDate','actualEndDate', 'amount','customerId','workId'],
            //逻辑：当订单状态等于退款-已完成、投诉-已完成或订单正常完成且评论不为空时
            where: [
                {
                    customerId: userId
                },
                {
                    '$or': [
                        { 'status': [STATUS_REFUNDED, STATUS_COMPLAINTSOUT, STATUS_COMPLETED, STATUS_CANCELLED] }
                    ]
                }],
            include: [
                {
                    model: Hospital,
                    paranoid: false,
                    attributes: ['name']
                },
                {
                    model: OrderRating,
                    paranoid: false
                }
            ]
        }).then(function (order) {
            var list = [];
            for (var i = 0; i < order.length; i++) {
                var obj = order[i].dataValues;
                obj.createdAt = moment(obj.createdAt).format('YYYY-MM-DD HH:mm:ss');
                // obj.actualStartDate = moment(obj.actualStartDate).format('YYYY-MM-DD HH:mm:ss');
                // var receivedTime = moment(obj.actualStartDate);
                // var timeOut = moment().unix() - receivedTime.unix();
                //得到订单进行的时间
                obj.actualStartDate = moment(obj.actualStartDate).format('YYYY-MM-DD HH:mm:ss');
                obj.actualEndDate = moment(obj.actualEndDate).format('YYYY-MM-DD HH:mm:ss');
                var actualStartDate = moment(obj.actualStartDate);
                var actualEndDate = moment(obj.actualEndDate);
                var timeOut = actualEndDate.unix() - actualStartDate.unix();
                obj.duration = Order.TimeFormat(timeOut);
                obj.ratingStatus = (obj.orderRating == null ? 0 : 1);
                list.push(obj);
            }
            return list;
        });
    };


    // 获取某护工所有完结订单yzl
    Order.GetWorkAllCompletedOrder = function(workId) {
        let OrderRating = sequelize.model('orderRating');
        let Hospital = sequelize.model('hospital');

        return Order.findAll({
            'attributes': [['id', 'order_id'],'tradeNum','status', 'createdAt','startDate', 'endDate','actualStartDate','actualEndDate','amount','customerId','workId'],
            'where': [
                {
                    'workId': { '$eq': workId }
                },
                {
                    'status': [STATUS_REFUNDED, STATUS_COMPLAINTSOUT, STATUS_COMPLETED, STATUS_CANCELLED]
                }],
            include: [
                {
                    model: OrderRating,
                    paranoid: false,
                    attributes: ['comment','ratingSkill', 'ratingAttitude']
                },
                {
                    model: Hospital,
                    paranoid: false,
                    attributes: ['name']
        
                }
            ]
        }).then(function (order) {
            var list = [];
            for (var i = 0; i < order.length; i++) {
                var obj = order[i].dataValues;
                obj.createdAt = moment(obj.createdAt).format('YYYY-MM-DD HH:mm:ss');
                obj.startDate = moment(obj.startDate).format('YYYY-MM-DD HH:mm:ss');
                obj.endDate = moment(obj.endDate).format('YYYY-MM-DD HH:mm:ss');
                //得到订单进行的时间
                obj.actualStartDate = moment(obj.actualStartDate).format('YYYY-MM-DD HH:mm:ss');
                obj.actualEndDate = moment(obj.actualEndDate).format('YYYY-MM-DD HH:mm:ss');
                var actualStartDate = moment(obj.actualStartDate);
                var actualEndDate = moment(obj.actualEndDate);
                var timeOut = actualEndDate.unix() - actualStartDate.unix();
                obj.duration = Order.TimeFormat(timeOut);
                obj.ratingStatus = (obj.orderRating == null ? 0 : 1);
                list.push(obj);
            }
            return list;
        });
    };
// //获取用户所有进行中的订单
//     Order.GetUserAllProcessingOrder = function (userId) {
//         let Hospital = sequelize.model('hospital');
//         return Order.findAll({
//             'attributes': [['id', 'order_id'], 'createdAt', 'status', 'price', 'actualStartDate', 'amount'],
//             'where': [
//                 {
//                     'customerId': { '$eq': userId }
//                 },
//                 {
//                     'status': [STATUS_PROGRESSING, STATUS_COMPLAINTS, STATUS_REFUNDING]
//                 }],
//             include: [
//                 {
//                     model: Hospital,
//                     paranoid: false,
//                     attributes: ['name']
//                 }
//             ]
//         }).then(function (order) {
//             var list = [];
//             for (var i = 0; i < order.length; i++) {
//                 var obj = order[i].dataValues;
//                 obj.createdAt = moment(obj.createdAt).format('YYYY-MM-DD hh:mm:ss');
//                 var receivedTime = moment(obj.actualStartDate);
//                 var timeOut = moment().unix() - receivedTime.unix();
//                 obj.duration = Order.TimeFormat(timeOut);
//                 list.push(obj);
//             }
//             return list;
//         });
//     }

    //通过userId获取订单信息yzl admin
    Order.GetUserOrderByUserId = function (options) {
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
        let Hospital = sequelize.model('hospital');
        return Order.findAll({
            'attributes': [['id', 'order_id'], 'tradeNum','dependentLevel','nursingTime','status', 'createdAt','price'],
            'where': [
                {
                    'customerId': { '$eq': options.query.userId }
                },
                ],
                limit:limit,
                offset: offset
        }).then(function (order) {
            var list = [];
            for (var i = 0; i < order.length; i++) {
                var obj = order[i].dataValues;
                obj.createdAt = moment(obj.createdAt).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                list.push(obj);
            }
            return list;
        });
    };
        //通过workId获取订单信息yzl admin
        Order.getWorkOrderByWorkId = function (options) {
            let OrderRating = sequelize.model('orderRating');
            let limit = options.pagination.limit;
            let offset = (options.pagination.page - 1) * limit;
            let Hospital = sequelize.model('hospital');
            return Order.findAll({
                'attributes': [['id', 'order_id'], 'tradeNum','dependentLevel','nursingTime','status', 'createdAt','price','amount'],
                where: [
                    {
                        'workId': { '$eq': options.query.workId }
                    },
                    ],
                    include: [
                        {
                            model: OrderRating,
                            paranoid: false,
                            attributes: ['ratingSkill', 'ratingAttitude', 'comment']
                        }],
                    limit:limit,
                    offset: offset
            }).then(function (order) {
                var list = [];
                for (var i = 0; i < order.length; i++) {
                    var obj = order[i].dataValues;
                    obj.createdAt = moment(obj.createdAt).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                    list.push(obj);
                }
                return list;
            });
        };
    //通过orderId获取订单信息yzl admin
    Order.GetUserOrderByOrderId = function (orderId) {
        let Hospital = sequelize.model('hospital');
        let User = sequelize.model('user');
        let Work = sequelize.model('work');
        let OrderRating = sequelize.model('orderRating');
        let OrderWork = sequelize.model('orderWork');
        let Service = sequelize.model('service');
        let OrderStatus = sequelize.model('orderStatus');
        let Admin  = sequelize.model('admin');
        let Role = sequelize.model('role');
        return Order.findAll({
            'attributes': [['id', 'order_id'], 'tradeNum','dependentLevel',
                            'nursingTime','status', 'startDate','endDate','createdAt',
                             'dayprice','price','amount'],
            'where': [
                {
                    'id': { '$eq': orderId }
                }],
            include: [
                {
                    model: Hospital,
                    paranoid: false,
                    attributes: ['name','state','city','region']
                },
                {
                    model:OrderStatus,
                    paranoid: false,
                    include:[
                        {
                            model:User,
                            attributes: ['name'],
                            paranoid: false,
                            include:[
                                {
                                    model:Admin,
                                    paranoid: false,
                                    attributes: [['id','admin_Id'],'status','userId'],
                                    include:[
                                        {
                                            model:Role,
                                            paranoid: false,
                                            attributes: ['name']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'customer',
                    paranoid: false,
                    attributes: ['name','gender','phoneNum','birthday']
                },
                {
                        model: Work,
                        paranoid: false,
                        attributes: ['name','gender','phoneNum','star','level'],
                        include: [
                            {
                                model: Service,
                                paranoid: false,
                                include: [
                                    {
                                        model: Hospital,
                                        paranoid: false,
                                        attributes: ['name']
                                    }
                                ]
                            }
                        ]
                },
                {
                    model: OrderRating,
                    paranoid: false,
                    attributes: ['comment','ratingSkill','ratingAttitude']
                }
            ]
        }).then(function (order) {
            var list = [];
            for (var i = 0; i < order.length; i++) {
                var obj = order[i].dataValues;
                obj.createdAt = moment(obj.createdAt).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                obj.startDate = moment(obj.startDate).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                obj.endDate = moment(obj.endDate).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                list.push(obj);
            }
            return list;
        });
    };

    //获取订单信息
    Order.OrderInfo = function (orderId) {
        let Hospital = sequelize.model('hospital');
        let User = sequelize.model('user');
        let Work = sequelize.model('work');
        let OrderRating = sequelize.model('orderRating');
        let Service = sequelize.model('service');
        return Order.find({
            attributes: [['id', 'order_id'], 'tradeNum', 'patientGender','workerGender','createdAt','status', 'price', 'actualStartDate', 'actualEndDate','startDate','endDate'],
            where: {
                id: orderId
            },
            include: [
                {
                    model: Hospital,
                    attributes: ['id','name', 'state', 'city', 'region', 'address', 'level'],
                    paranoid: false
                },
                {
                    model: User,
                    as: 'customer',
                    attributes: ['id','name', 'gender', 'phoneNum'],
                    paranoid: false
                },
                {
                    model: Work,
                    attributes: ['id', 'name', 'age','gender', 'avatar', 'level','star'],
                    paranoid: false,
                    // include:[{model:Service}]
                },
                {
                    model: OrderRating,
                    attributes: ['comment','ratingSkill', 'ratingAttitude'],
                    paranoid: false
                }
            ]
        }).then(function (order) {
            var orderInfo = [];
            var obj = order.dataValues;
            obj.createdAt = moment(obj.createdAt).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
            obj.startDate = moment(obj.startDate).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
            obj.endDate = moment(obj.endDate).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
            obj.ratingStatus = (obj.orderRating == null ? 0 : 1);
            obj.startStatus = (order.status == STATUS_PAID && order.startDate > Date.now() ? 0 : 1);
            obj.actualStartDate = moment(obj.actualStartDate).format('YYYY-MM-DD HH:mm:ss');
            obj.actualEndDate = moment(obj.actualEndDate).format('YYYY-MM-DD HH:mm:ss');
            //得到订单进行的时间
            
            //如果在已完成状态里，duration要用实际时间相减，否则用当前时间减去实际开始时间
            if(STATUSES_WORKER_RELEASABLE.indexOf(obj.status) >= 0){
            // obj.actualStartDate = moment(obj.actualStartDate).format('YYYY-MM-DD HH:mm:ss');
            // obj.actualEndDate = moment(obj.actualEndDate).format('YYYY-MM-DD HH:mm:ss');

            var actualStartDate = moment(obj.actualStartDate);
            var actualEndDate = moment(obj.actualEndDate);
            var timeOut = actualEndDate.unix() - actualStartDate.unix();
            obj.duration = Order.TimeFormat(timeOut);
            }else if(obj.status===STATUS_PROGRESSING){
            //obj.actualStartDate = moment(obj.actualStartDate).format('YYYY-MM-DD HH:mm:ss');
            var receivedTime = moment(obj.actualStartDate);
            var timeOut = moment().unix() - receivedTime.unix();
            obj.duration = Order.TimeFormat(timeOut);
            };
            if(!obj.estimatedTime){
                var startDate = moment(obj.startDate);
                var endDate = moment(obj.endDate);
                var timeOut = endDate.unix() - startDate.unix();
                obj.estimatedTime = Order.TimeFormat(timeOut);
            };
            //obj.hospitalAddress=obj.hospital.state+obj.hospital.city+obj.hospital.region+obj.hospital.region; 
            orderInfo.push(obj);
            return orderInfo;
        });
    }

    Order.OrderStatus = function (orderId) {
        return Order.find({
            where: {
                id: orderId
            },
        });
    }
    //订单创建
    Order.CreateOrder = function (orderParm) {
        let workPrice = require('./index').price;
        let OrderStatus = sequelize.model('orderStatus');
        let OrderWorks = sequelize.model('orderWork');  

        return workPrice.queryPriceByWorkId(orderParm.workId, 
            orderParm.startDate.substring(0, 10), 
            orderParm.endDate.substring(0, 10)).then(function (workPrice) {
            var tradeNum = moment().format('YYYYMMDDhmmss') + moment().format('X');
            orderParm.tradeNum = tradeNum;
            orderParm.status = STATUS_UNPAID;
            orderParm.dayPrice = workPrice.pricePerDay;
            orderParm.price = workPrice.total;
            orderParm.amount = workPrice.total;
            //创建订单时没有实际开始时间和结束时间
            // orderParm.actualStartDate = orderParm.startDate;
            // orderParm.actualEndDate = orderParm.endDate;

            return sequelize.transaction(function (t) {
                return Order.create(orderParm,{transaction: t }).then(function (order){
                     let oStatusParm={};
                    oStatusParm.status=STATUS_UNPAID;
                    oStatusParm.orderId=order.dataValues.id;
                    oStatusParm.changedAt= Date.now();
                    oStatusParm.userId=order.dataValues.customerId;
                    return OrderStatus.create(oStatusParm,{transaction: t}).then(function(oStatus){
                          let oWorkParm={};
                          oWorkParm.orderId=order.dataValues.id;
                          oWorkParm.workId=order.dataValues.workId;
                          oWorkParm.status='idle';
                          return OrderWorks.create(oWorkParm,{transaction: t}).then(function(oWork){
                             return order;
                          });
                    }); 
                });
            });  
        });
    }
    //终止订单
    Order.EndOrder = function (userId,orderId,status) {
        //查询当前订单状态是否等于未付款,如果是直接进行取消
        if (status == STATUS_UNPAID) {
            return Order.UpdateOrder(orderId,STATUS_CANCELLED,userId);
        }
        else if (status == STATUS_PAID) {  //否则等于付款的就走退款流程
            return Order.UpdateOrder(orderId,STATUS_REFUNDING,userId);
        }
        else { }
    }

    //更新订单状态
    Order.UpdateOrder = function (orderId, upStatus,userId) {
        let OrderStatus = sequelize.model('orderStatus');

        return sequelize.transaction(function (t) {
            let orderParm = {};
            orderParm["status"] = upStatus;
            return Order.update(orderParm, 
                { where: { id: orderId }, transaction: t }).then(function (order) {
                //增加一条状态变更记录
                let oStatusParm={};
                oStatusParm.status=upStatus;
                oStatusParm.orderId=orderId;
                oStatusParm.changedAt= Date.now();
                oStatusParm.userId=userId;
                return OrderStatus.create(oStatusParm,{transaction: t}).then(function(oStatus){
                    return order;
                });
            });
        });
    }
    //换护工

    //订单评论
    //comment 评论内容
    //ratingSkill 等级技能
    //ratingAttitude  评价态度
    Order.OrderRatingAdd=function(orderId,comment,ratingSkill,ratingAttitude){
        let OrderRating = sequelize.model('orderRating');

        let ratingParm = {};
        ratingParm.comment = comment;
        ratingParm.ratingSkill = ratingSkill;
        ratingParm.ratingAttitude = ratingAttitude;
        ratingParm.changedAt= Date.now();
        ratingParm.orderId=orderId;

        return OrderRating.create(ratingParm);
    }


    //秒转化成 时分秒
    Order.TimeFormat = function secondToDate(result) {
        var t = Math.floor((result / 3600) / 24);
        var h = Math.floor(result / 3600);
        var m = Math.floor((result / 60 % 60));
        var s = Math.floor((result % 60));
        if (t > 0) {
            return result = t + "天 " + h + ":" + m + ":" + s;
        }
        else {
            return result = h + ":" + m + ":" + s;
        }
    };
    Order.TimeFormatHour = function secondToDate(result) {
        var t = Math.floor((result / 3600) / 24);
        var h = Math.floor(result / 3600);
        var m = Math.floor((result / 60 % 60));
        var s = Math.floor((result % 60));
        return result = h ;
        // if (t > 0) {
        //     return result = t + "天 " + h + ":" + m + ":" + s;
        // }
        // else {
        //     return result = h + ":" + m + ":" + s;
        // }
    };
    Order.query=function (orderId) {
        let Hospital = sequelize.model('hospital');
        let User = sequelize.model('user');
        let Work = sequelize.model('work');
        let OrderWork = sequelize.model('orderWork');
        let Price = sequelize.model('price');
        let OrderStatus = sequelize.model('orderStatus');
       // let CheckIn = sequelize.model('checkIn');
        return Order.findOne({
            where: {
                id: orderId
            },
            include: [
                {
                    model: Work,
                    include: [Price],
                    paranoid: false
                },
                {
                    model: Hospital,
                    paranoid: false
                },
                {
                    model: User,
                    as: 'customer',
                    paranoid: false
                },
                {
                    model: User,
                    as: 'payer',
                    paranoid: false
                },
                {
                    model: OrderStatus,
                    paranoid: false,
                    include: [
                        {
                            model: User
                        }
                    ]
                },
                {
                    model: OrderWork,
                    as: 'orderWorks',
                    include: [
                        {
                            model: Work,
                            paranoid: false
                        }
                    ]
                },
                // {
                //     model: CheckIn,
                //     paranoid: false
                // }
            ],
            order: [
                [OrderStatus, 'id', 'ASC'],
                //[CheckIn, 'date', 'DESC']
            ]
        });
    };
    Order.prototype.canSubstitute=function () {
        return STATUSES_SUBSTITUTABLE.indexOf(this.status) >= 0;
    },
    Order.prototype.canRefund= function () {
        return STATUSES_REFUNDABLE.indexOf(this.status) >= 0;
    },
    Order.prototype.canCancel = function(){
        return STATUSES_CANCELABLE.indexOf(this.status) >= 0;
    };
    Order.prototype.canStart = function(){
        return STATUSES_STARTABLE.indexOf(this.status) >= 0;
    };
    Order.prototype.canCompleted = function(){
        return STATUSES_SUBSTITUTABLE.indexOf(this.status) >= 0;
    };
    Order.prototype.canCancelOrRefund=function () {
        return this.canCancel() || this.canRefund();
    };
    Order.prototype.markCancelPending= function () {
        return this.markStatus(STATUSES_CANCELABLE, STATUS_CANCEL_PENDING);
    };
    Order.prototype.markCancelling= function () {
        return this.markStatus(STATUS_CANCEL_PENDING, STATUS_CANCELLING);
    };
    Order.prototype.markCanceled= function () {
        return this.markStatus(STATUS_CANCELLING, STATUS_CANCELLED);
    };

    Order.prototype.markRefundPending=function () {
        return this.markStatus(STATUSES_REFUNDABLE, STATUS_REFUND_PENDING);
    };
    Order.prototype.markRefunding= function () {
        return this.markStatus(STATUS_REFUND_PENDING, STATUS_REFUNDING);
    };
    Order.prototype.markRefunded= function () {
        return this.markStatus(STATUS_REFUNDING, STATUS_REFUNDED);
    };

    Order.prototype.markSubstitutePending= function () {
        return this.markStatus(STATUSES_SUBSTITUTABLE, STATUS_SUBSTITUTE_PENDING);
    };
    Order.prototype.markSubstituting= function () {
        return this.markStatus(STATUS_SUBSTITUTE_PENDING, STATUS_SUBSTITUTING);
    };
    Order.prototype.markSubstituted= function () {
        return this.markStatus(STATUS_SUBSTITUTING, STATUS_SUBSTITUTED);
    };

    Order.prototype.markStatus = function (currentStatus, nextStatus) {
        currentStatus = [].concat(currentStatus || STATUS);

        let self = this;
        let OrderWork = sequelize.model('orderWork');
        return sequelize.transaction(function (t) {
            return Order.update(
                {
                    status: nextStatus
                }, {
                    where: {
                        id: self.id,
                        status: {
                            in: currentStatus
                        }
                    },
                    transaction: t
                }).then(function (affectedRows) {
                if (!affectedRows[0]) {
                    throw new Error();
                }
                if (STATUSES_WORKER_RELEASABLE.indexOf(nextStatus) > 0) {
                    return OrderWork.update({
                        status: OrderWork.STATUS_REJECT
                    }, {
                        where: {
                            orderId: self.id,
                            status: OrderWork.STATUS_IDLE
                        },
                        transaction: t
                    }).then(function () {
                        return true;
                    });
                }
                return true;
            });
        });
    };
   
    //实例方法
    Order.prototype.toJSON = function () {
        let values = this.dataValues;
        let excludeValue = ['ctime', 'utime', 'dtime','id'];
        values.order_id = values.id; 
        values.createdAt = moment(values.createdAt).format('YYYY-MM-DD HH:mm:ss');
        values.startDate = moment(values.startDate).format('YYYY-MM-DD HH:mm:ss');
        values.endDate = moment(values.endDate).format('YYYY-MM-DD HH:mm:ss');
        if(values.actualStartDate){
        values.actualStartDate = moment(values.actualStartDate).format('YYYY-MM-DD HH:mm:ss');
        };
        if(values.actualEndDate){
        values.actualEndDate = moment(values.actualEndDate).format('YYYY-MM-DD HH:mm:ss');
        };
        if(!values.estimatedTime){
            var startDate = moment(values.startDate);
            var endDate = moment(values.endDate);
            var timeOut = endDate.unix() - startDate.unix();
            values.estimatedTime = Order.TimeFormat(timeOut);
        };
        
        //let areacreattime = moment(values.ctime).format('YYYY-MM-DD');
        //values.areacreattime = areacreattime;
        values = _.omit(values, excludeValue);
        return values;
    }
    Order.STATUS_UNPAID = STATUS_UNPAID;
    Order.STATUS_PAID = STATUS_PAID;
    Order.STATUS_SIGNED = STATUS_SIGNED;
    Order.STATUS_PROGRESSING = STATUS_PROGRESSING;
    Order.STATUS_COMPLETED = STATUS_COMPLETED;
    Order.STATUS_CANCEL_PENDING = STATUS_CANCEL_PENDING;
    Order.STATUS_CANCELLING = STATUS_CANCELLING;
    Order.STATUS_CANCELLED = STATUS_CANCELLED;
    Order.STATUS_REFUND_PENDING = STATUS_REFUND_PENDING;
    Order.STATUS_REFUNDING = STATUS_REFUNDING;
    Order.STATUS_REFUNDED = STATUS_REFUNDED;
    Order.STATUS_SUBSTITUTE_PENDING = STATUS_SUBSTITUTE_PENDING;
    Order.STATUS_SUBSTITUTING = STATUS_SUBSTITUTING;
    Order.STATUS_SUBSTITUTED = STATUS_SUBSTITUTED;
    Order.STATUSES_PENDING = STATUSES_PENDING;

    Order.STATUSES_REFUNDABLE = STATUSES_REFUNDABLE;
    Order.STATUSES_CANCELABLE = STATUSES_CANCELABLE;
    Order.STATUSES_STARTABLE= STATUSES_STARTABLE
    Order.STATUSES_SUBSTITUTABLE = STATUSES_SUBSTITUTABLE;
    
    Order.STATUS = STATUS;
    return Order;
}


