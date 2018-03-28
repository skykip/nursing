"use strict";
const moment = require('moment');
const GENDER_MALE = 'male';
const GENDER_FEMALE = 'female';
const STATUS_CHECKING = 'checking';
const STATUS_APPROVED = 'approved';
const STATUS_DISAPPROVED = 'disapproved';
const WORKER_TYPE_FORMAL = 'formal';
const WORKER_TYPE_INFORMAL = 'informal';
const WORKER_ACTIVE = 'active';
const WORKER_INACTIVE = 'inactive';


const STATUS = [
    STATUS_CHECKING,
    STATUS_APPROVED,
    STATUS_DISAPPROVED
];
const WORKSTATUS = [
    WORKER_ACTIVE,
    WORKER_INACTIVE
];

const GENDER = [
    GENDER_MALE,
    GENDER_FEMALE
];

const WORKER_TYPE = [
    WORKER_TYPE_FORMAL,
    WORKER_TYPE_INFORMAL
];

module.exports = function (sequelize, DataTypes) {
    const Work = sequelize.define("work", {
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
            comment: '性别'
        },
        birthday:{ //新增
            type: DataTypes.STRING,
            allowNull: true,
            comment: '生日'
        },
        level: {
            type: DataTypes.STRING(32),
            comment: '服务等级'
        },
        star: {
            type: DataTypes.STRING(32),
            comment: '护工星级'
        },
        phoneNum: {
            type: DataTypes.STRING(32),
            comment: '电话号码'
        },
        prov: {
            type: DataTypes.STRING(5),
            comment: '省'
        },
        city: {
            type: DataTypes.STRING(5),
            comment: '城市'
        },
        status: {
            type: DataTypes.ENUM,
            values: STATUS,
            defaultValue: STATUS_CHECKING,
            comment: '状态'
        },
        workStatus: {//新增
            type: DataTypes.ENUM,
            values: WORKSTATUS,
            defaultValue: WORKER_INACTIVE,
            comment: '接单状态'
        },
        idCardNum: {
            type: DataTypes.STRING(20),
            comment: '身份证号码'
        },
        idCardFrontPic: {//新增
            type: DataTypes.STRING,
            comment: '身份证正面图片'
        },
        idCardBackPic: {//新增
            type: DataTypes.STRING,
            comment: '身份证背面图片'
        },
        healthCardPic: {//新增
            type: DataTypes.STRING,
            comment: '健康证图片'
        },
        age: {//修改
            type: DataTypes.INTEGER,
            comment: '年龄'
            // type: new DataTypes.VIRTUAL(DataTypes.INTEGER, ['idCardNum']),
            // get: function () {
            //     let idCardNum = this.get('idCardNum');
            //     if (!idCardNum) {
            //         return 0;
            //     }
            //     let IdValidator = require('id-validator');
            //     let moment = require('moment');
            //     let GB2260 = require('id-validator/src/GB2260');
            //     let Validator = new IdValidator(GB2260);
            //     if (!Validator.isValid(idCardNum)) {
            //         return 0;
            //     }
            //     let birth = Validator.getInfo(idCardNum).birth;
            //     let age = moment(birth, "YYYY-MM-DD").fromNow().split(" ")[0];
            //     return parseInt(age) || 0;
            // }
        },
        description: {
            comment: '描述',
            type: DataTypes.TEXT
        },
        avatar: {//yzl修改
            comment: '头像',
            type: DataTypes.STRING(191)
            // validate: {
            //     isUrl: true
            //     // {
            //     //     msg: 'Invalid avatar url'
            //     // }
            // }
        },
        exp: {
            comment: '护理经验',
            type: DataTypes.FLOAT,
            defaultValue: 0.0
        },
        workType: {
            comment: '护工类型',
            type: DataTypes.ENUM,
            values: WORKER_TYPE
        },
        dtime: {
            type: DataTypes.DATE,
            //unique: 'unique_work'
        }
    }, {
        comment: '护工表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: true,
        getterMethods: {}
    });
    //类方法
    Work.associate = function (models) {
    //     Work.hasOne(models.punishment);
        Work.belongsTo(models.price);
        Work.belongsTo(models.paymentMethod);
        Work.hasMany(models.service);
        Work.hasMany(models.order);
    //     Work.hasMany(models.salary);
        Work.hasMany(models.orderWork);
        Work.hasMany(models.reviewLog);
        Work.belongsTo(models.user, {
            foreignKey: {
                unique: 'unique_work'
            }
        });
    };

    // Work.queryById = function (id, includeDeleted) {
    //     let User = sequelize.model('user');
    //     let Price = sequelize.model('price');
    //     let Service = sequelize.model('service');
    //     let Hospital = sequelize.model('hospital');
    //     let Punishment = sequelize.model('punishment');
    //     return Work.findOne({
    //         where: {
    //             id: id
    //         },
    //         include: [
    //             {
    //                 model: User
    //             },
    //             {
    //                 model: Price
    //             },
    //             {
    //                 model: Service,
    //                 include: [Hospital]
    //             },
    //             {
    //                 model: Punishment
    //             }
    //         ],
    //         paranoid: !includeDeleted
    //     });
    // };

    //按照给定id来查询对应护工
    Work.queryById = function(id,includeDeleted) {
        let User = sequelize.model('user');
        let Price = sequelize.model('price');
        let Service = sequelize.model('service');
        let Hospital = sequelize.model('hospital');
        let paymentMethod = sequelize.model('paymentMethod');
        return Work.find({
            where: {
                id:id,
            },
            include: [
                {
                    model: User
                     },
                {
                    model: Price
                    },
                {
                     model: Service,
                    include: [Hospital]
                    },
                {
                    model: paymentMethod
                    } 
            ],
            paranoid: !includeDeleted
        });
    };
    //按照给定id来查询对应护工
    Work.queryWorkByUserId= function(userId) {
        return Work.findOne({
            //attributes: ['id'],
            where: {
                userId:userId
            }
        });
    };
    //按照给定id来查询对应护工的认证状态yzl################
    Work.queryAuthById = function(id) {
        return Work.find({
            where: {
                id:id,
            },
            attributes: ['status'],
        });
    };
    //查询所有checking状态（基本信息和认证信息都完成）护工的个人信息yzl################admin
    Work.queryWorksAuth = function(options) {
        let User = sequelize.model('user');
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
        return Work.findAll({
            where: {
                status:STATUS_CHECKING,
                name:{'$ne': null },
                name:{'$ne': '' },
                gender:{'$ne': null },
                gender:{'$ne': '' },
                idCardNum:{'$ne': null },
                idCardNum:{'$ne': '' },
                phoneNum:{'$ne': null },
                phoneNum:{'$ne': '' },
                birthday:{'$ne': null },
                birthday:{'$ne': '' },
                level:{'$ne': null },
                level:{'$ne': '' },
                prov:{'$ne': null },
                prov:{'$ne': '' },
                city:{'$ne': null },
                city:{'$ne': '' },
                exp:{'$ne': null },
                priceId:{'$ne': null},
                avatar:{'$ne': null },
                avatar:{'$ne': '' },
                description:{'$ne': null },
                description:{'$ne': '' },
                idCardFrontPic:{'$ne': null },
                idCardFrontPic:{'$ne': '' },
                idCardBackPic:{'$ne': null },
                idCardBackPic:{'$ne': '' },
                healthCardPic:{'$ne': null },
                healthCardPic:{'$ne': '' },
            },
            limit:limit,
            offset:offset,
            include:[
                {
                    model:User,
                    attributes: ['wechatname']
                }
            ]
        });
    };
    //查询所有checking状态护工完善了基本信息但是没有认证信息的护工信息yzl################admin
    Work.queryWorksBasicInfo = function(options) {
        let User = sequelize.model('user');
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
        return Work.findAll({
            where: {
                status:STATUS_CHECKING,
                name:{'$ne': null },
                name:{'$ne': '' },
                gender:{'$ne': null },
                gender:{'$ne': '' },
                idCardNum:{'$ne': null },
                idCardNum:{'$ne': '' },
                phoneNum:{'$ne': null },
                phoneNum:{'$ne': '' },
                birthday:{'$ne': null },
                birthday:{'$ne': '' },
                level:{'$ne': null },
                level:{'$ne': '' },
                prov:{'$ne': null },
                prov:{'$ne': '' },
                city:{'$ne': null },
                city:{'$ne': '' },
                exp:{'$ne': null },
                priceId:{'$ne': null},
                avatar:{'$ne': null },
                avatar:{'$ne': '' },
                description:{'$ne': null },
                description:{'$ne': '' },
                '$or':[
                    
                    {   '$or':[
                        {healthCardPic:{'$eq': null }},
                        {healthCardPic:{'$eq': '' }},
                        ]
                    },

                    {
                        '$or':[
                        {idCardFrontPic:{'$eq': null }},
                        {idCardFrontPic:{'$eq': '' }},
                        ]
                    },

                    {
                        '$or':[
                        {idCardBackPic:{'$eq': null }},
                        {idCardBackPic:{'$eq': '' }},
                        ]
                    }
                ]
            },
            limit:limit,
            offset:offset,
            include:[
                {
                    model:User,
                    attributes: ['wechatname']
                }
            ]
        });
    };

    //查询所有disapprove状态护工的个人信息yzl################admin
    Work.queryWorksDisapprove = function(options) {
        let User = sequelize.model('user');
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
        return Work.findAll({
            where: {
                status:STATUS_DISAPPROVED,
            },
            limit:limit,
            offset:offset,
            include:[
                {
                    model:User,
                    attributes: ['wechatname']
                }
            ]
        });
    };


    //按照给定id来查询对应护工的身份证信息yzl################
    Work.queryIdCardById = function(id) {
        return Work.find({
            where: {
                id:id,
            },
            attributes: ['idCardNum'],
        });
    }

    //按照给定条件查询护工列表
    Work.queryAll = function(options) {
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
        return Work.findAll({
            where: options.where,
            limit: limit,
            offset: offset,
        });
    };

    //按照限制信息查询符合条件的护工yzl################admin
    //status=0 -》所有护工 status=1 -》审核通过护工 status=2 -》待审核护工 
    Work.queryAllWorks=function (options,status) {
        let User = sequelize.model('user');
        let Price = sequelize.model('price');
        let Service = sequelize.model('service');
        let Hospital = sequelize.model('hospital');
        let ReviewLog = sequelize.model('reviewLog');
        let paymentMethod = sequelize.model('paymentMethod');
        //let Punishment = sequelize.model('punishment');
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
        

        let names = options.query.names;
        let phoneNums = options.query.phoneNums;
        let wechatNames = options.query.wechatNames;
        let idCardNums = options.query.idCardNums;
        let stars = options.query.stars;
        let gender = options.query.gender;
        let workType = options.query.workType;
        let hospitalId = options.query.hospitalId;
        let state = options.query.state;
        let city = options.query.city;
        let region = options.query.region;
        let workStatus = options.query.workStatus;
        //把护工的医院限制去掉
        //let hospitalIds = null;
    //##################work参数
        let whereClause = {};

        // if(status!==0){
        //     whereClause.status = status
        // };
        if (status && status.length) {
            whereClause.status = status;
            
        };
        if (names && names.length) {
            whereClause.name = {
                '$like': '%'+names+'%'
            }
        };
        if (phoneNums && phoneNums.length) {
            whereClause.phoneNum = {
                '$like': '%'+phoneNums+'%'
            }
        };
        if (idCardNums && idCardNums.length) {
            whereClause.idCardNum = {
                '$like': '%'+idCardNums+'%'
            }
        };
        if (stars && stars.length) {
            whereClause.star = {
                in: stars
            }
        };
        if (gender && gender.length) {
            whereClause.gender = {
                in: gender
            }
        };
        if (workType && workType.length) {
            whereClause.workType = {
                in: workType
            }
        };
        if(workStatus && workStatus.length){
            whereClause.workStatus={
                in: workStatus
            }
        };
        //必须这么写，否则就会查询跟work有关系的user，导致查询结果变少
        //################user参数
        let userWhereClause = null;
        if (wechatNames && wechatNames.length) {
            userWhereClause= {
                wechatname:{'$like': '%'+wechatNames+'%'}
            }
        };
        //################service参数
        let serviceWhereClause = {};
        if (state && state.length) {
            serviceWhereClause.state = {
                in: state
            }
        };
        if (city && city.length) {
            serviceWhereClause.city = {
                in: city
            }
        };
        if (region && region.length) {
            serviceWhereClause.region = {
                in: region
            }
        };
        if(hospitalId && hospitalId.length){
            serviceWhereClause.hospitalId={
                in: hospitalId
            }
        };
        // if(workStatus && workStatus.length){
        //     serviceWhereClause.status={
        //         in: workStatus
        //     }
        // };
        //如果serviceWhereClause为空对象{}，则置为null
        if(JSON.stringify(serviceWhereClause) == "{}"){
            serviceWhereClause=null;
        };
    
        return Work.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    where:userWhereClause
                },{
                    model: paymentMethod
                },
                {
                    model: Price
                },
                {
                    model: Service,
                    include: [Hospital],
                    where: serviceWhereClause
                },
                {
                    model: ReviewLog,
                    include: [User]
                }
                // {
                //     model: Punishment
                // }
            ],
            limit: limit,
            offset: offset,
            //paranoid: false
            // order: [
            //     [ReviewLog, 'id', 'ASC']
            // ],
            //paranoid: !includeDeleted
        });
    };

    //按照限制信息查询符合条件的已删除护工yzl################admin
    //status=0 -》所有护工 status=1 -》审核通过护工 status=2 -》待审核护工 
    Work.queryDeletedWorks = function (options,status) {
        let User = sequelize.model('user');
        let Price = sequelize.model('price');
        let Service = sequelize.model('service');
        let Hospital = sequelize.model('hospital');
        let ReviewLog = sequelize.model('reviewLog');
        //let Punishment = sequelize.model('punishment');
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
        

        let names = options.query.names;
        let phoneNums = options.query.phoneNums;
        let wechatNames = options.query.wechatNames;
        let idCardNums = options.query.idCardNums;
        let stars = options.query.stars;
        let gender = options.query.gender;
        let workType = options.query.workType;
        let hospitalId = options.query.hospitalId;
        let state = options.query.state;
        let city = options.query.city;
        let region = options.query.region;
        let workStatus = options.query.workStatus;
        //把护工的医院限制去掉
        //let hospitalIds = null;
    //##################work参数
        let whereClause = {
            dtime: {
                $ne: null
            }
        };
        if (status && status.length) {
            whereClause.status = status;
            
        };
        if (names && names.length) {
            whereClause.name = {
                '$like': '%'+names+'%'
            }
        };
        if (phoneNums && phoneNums.length) {
            whereClause.phoneNum = {
                '$like': '%'+phoneNums+'%'
            }
        };
        if (idCardNums && idCardNums.length) {
            whereClause.idCardNum = {
                '$like': '%'+idCardNums+'%'
            }
        };
        if (stars && stars.length) {
            whereClause.star = {
                in: stars
            }
        };
        if (gender && gender.length) {
            whereClause.gender = {
                in: gender
            }
        };
        if (workType && workType.length) {
            whereClause.workType = {
                in: workType
            }
        };
         if(workStatus && workStatus.length){
            whereClause.workStatus={
                in: workStatus
            }
        };
        //必须这么写，否则就会查询跟work有关系的user，导致查询结果变少
        //################user参数
        let userWhereClause = null;
        if (wechatNames && wechatNames.length) {
            userWhereClause= {
                wechatname:{'$like': '%'+wechatNames+'%'}
            }
        };
        //################service参数
        let serviceWhereClause = {};
        if (state && state.length) {
            serviceWhereClause.state = {
                in: state
            }
        };
        if (city && city.length) {
            serviceWhereClause.city = {
                in: city
            }
        };
        if (region && region.length) {
            serviceWhereClause.region = {
                in: region
            }
        };
        if(hospitalId && hospitalId.length){
            serviceWhereClause.hospitalId={
                in: hospitalId
            }
        };
        // if(workStatus && workStatus.length){
        //     serviceWhereClause.status={
        //         in: workStatus
        //     }
        // };
        //如果serviceWhereClause为空对象{}，则置为null
        if(JSON.stringify(serviceWhereClause) == "{}"){
            serviceWhereClause=null;
        };

        return Work.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    where:userWhereClause
                },
                {
                    model: Price
                },
                {
                    model: Service,
                    include: [Hospital],
                    where: serviceWhereClause
                },
                {
                    model: ReviewLog,
                    include: [User]
                }
                // {
                //     model: Punishment
                // }
            ],
            limit: limit,
            offset: offset,
            paranoid: false
        });
    };
    // 添加单个护工
    Work.addWork = function(workInfo) {
        return Work.create(workInfo);
    }

    // 修改某个护工数据yzl##############################
    Work.updateWorkById = function(id, values) {
        let User = sequelize.model('user');
        return Work.update(
            values, 
            {
                where:{
                    id:id
                }
        });
    }

    // 更新护工认证数据yzl##############################
    Work.updateAuthWorkById = function(id, values) {
        return Work.update(
            values, 
            {
                where:{
                    id:id
                }
        });
    }

    // 删除某个护工信息
    Work.deleteWorkById = function(id) {
        return Work.destroy({where:{id:id}});
    }

    Work.queryByIds = function(workIds, includeDeleted) {
        let User = sequelize.model('user');
        let Price = sequelize.model('price');
        let Service = sequelize.model('service');
        let Hospital = sequelize.model('hospital');
        let Punishment = sequelize.model('punishment');
        workIds = [].concat(workIds || []);
        return Work.findAll({
            where: {
                id: {
                    in: workIds
                }
            },
            include: [
                {
                    model: User
                },
                {
                    model: Price
                },
                {
                    model: Service,
                    include: [Hospital]
                },
                {
                    model: Punishment
                }
            ],
            paranoid: !includeDeleted
        });
    };

    Work.queryByUserId = function (userId) {
        let User = sequelize.model('user');
        let Price = sequelize.model('price');
        let Service = sequelize.model('service');
        let Punishment = sequelize.model('punishment');
        return Work.findOne({
            where: {
                userId: userId
            },
            include: [
                {
                    model: User
                },
                {
                    model: Price
                },
                {
                    model: Service
                },
                {
                    model: Punishment
                }
            ]
        });
    };

    // Work.queryAll = function (options, includeDeleted) {
    //     let User = sequelize.model('user');
    //     let Price = sequelize.model('price');
    //     let Service = sequelize.model('service');
    //     let Hospital = sequelize.model('hospital');
    //     let ReviewLog = sequelize.model('reviewLog');
    //     let Punishment = sequelize.model('punishment');
    //     let limit = options.pagination.limit;
    //     let offset = (options.pagination.page - 1) * limit;
    //     let ids = options.query.ids;
    //     let userIds = options.query.userIds;
    //     let statuses = options.query.statuses;
    //     let genders = options.query.genders;
    //     let hospitalIds = options.query.hospitalIds;
    //     //把护工的医院限制去掉
    //     //let hospitalIds = null;
    //     let whereClause = {};

    //     if (ids && ids.length) {
    //         whereClause.id = {
    //             in: ids
    //         }
    //     }
    //     if (userIds && userIds.length) {
    //         whereClause.userId = {
    //             in: userIds
    //         }
    //     }
    //     if (statuses && statuses.length) {
    //         whereClause.status = {
    //             in: statuses
    //         }
    //     }
    //     if (genders && genders.length) {
    //         whereClause.gender = {
    //             in: genders
    //         }
    //     }
    //     let serviceWhereClause = null;
    //     if (hospitalIds && hospitalIds.length) {
    //         serviceWhereClause =  {
    //             hospitalId: {
    //                 in: hospitalIds
    //             }
    //         }
    //     }
    //     return Work.findAll({
    //         where: whereClause,
    //         include: [
    //             {
    //                 model: User
    //             },
    //             {
    //                 model: Price
    //             },
    //             {
    //                 model: Service,
    //                 include: [Hospital],
    //                 where: serviceWhereClause
    //             },
    //             {
    //                 model: ReviewLog,
    //                 include: [User]
    //             },
    //             {
    //                 model: Punishment
    //             }
    //         ],
    //         limit: limit,
    //         offset: offset,
    //         order: [
    //             [ReviewLog, 'id', 'ASC']
    //         ],
    //         paranoid: !includeDeleted
    //     });
    // };

    Work.queryDeleted = function () {
        let User = sequelize.model('user');
        let Price = sequelize.model('price');
        let ReviewLog = sequelize.model('reviewLog');

        let whereClause = {
            dtime: {
                $ne: null
            }
        };
        return Work.findAll({
            where: whereClause,
            include: [
                {
                    model: User
                },
                {
                    model: Price
                },
                {
                    model: ReviewLog
                }
            ],
            order: [
                [ReviewLog, 'id', 'DESC']
            ],
            paranoid: false
        });
    };

    Work.updatePrices = function (ids, priceId) {
        return sequelize.transaction(function (t) {
            return Work.update(
                {
                    priceId: priceId
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
    Work.prototype.toJSON = function () {
       
        // let fields = [
        //     "id",
        //     "name",
        //     "gender",
        //     "birthday",
        //     "phoneNum",
        //     "prov",
        //     "city",
        //     "status",
        //     "idCardNum",
        //     "description",
        //     "avatar",
        //     "exp",
        //     "user",
        //     "price",
        //     "workType",
        //     "reviewLogs",
        //     "level",
        //     "star",
        //     // extend values
        //     "age",
        //     "service",
        //     "punishment"
        // ];
        //values.age = this.age;
        let _ = require('lodash');
        let values = this.dataValues;
        if(values.service){
            values.service = this.formatService();
        };
        let excludeValue = ['ctime','utime', 'dtime','id','orders','orderWorks'];
        let workCreatTime = moment(values.ctime).format('YYYY-MM-DD HH:mm:ss');
        
        values.workCreatTime = workCreatTime;

        //加入删除护工时间
        if(values.dtime){
            let workDeletedTime = moment(values.dtime).format('YYYY-MM-DD HH:mm:ss');
            values.workDeletedTime = workDeletedTime;
        };

        values.work_id = values.id;
        values = _.omit(values, excludeValue);
        // values = _.pick(values, fields);
        //delete values.id;

        values.gender_desc  = {'male':'男', 'female':'女'}[values.gender];
        values.level_desc = {1:'初级', 2:'中级', 3:'高级'}[parseInt(values.level)];
        values.status_desc = {'checking':'审核', 'approved':'通过', 'disapproved':'不通过'}[values.status];
        values.workType_desc = {'formal':'平台护工', 'informal':'自聘护工'}[values.workType];

        return values;
    };

    //连接护工医院配置，需要在order中连表查询，eg见order中的GetUserOrderByOrderId
    Work.prototype.formatService = function () {
        let self = this;
        let service = {
            patientGender: [],
            nursingTime: [],
            dependentLevel: [],
            workId: self.id,
            state: null,
            city: null,
            region: null,
            status: null,
            hospital: []
        };
        let services = this.services;
        if (services && services.length > 0) {
            service.status = services[0].status;
            service.state = services[0].state;
            service.city = services[0].city;
            service.region = services[0].region;
            let hospitalIds = [];
            services.forEach(function (s) {
                if (service.patientGender.indexOf(s.patientGender) === -1) {
                    service.patientGender.push(s.patientGender);
                }
                if (service.nursingTime.indexOf(s.nursingTime) === -1) {
                    service.nursingTime.push(s.nursingTime);
                }
                if (service.dependentLevel.indexOf(s.dependentLevel) === -1) {
                    service.dependentLevel.push(s.dependentLevel);
                }
                if (!!s.hospital && hospitalIds.indexOf(s.hospitalId) === -1) {
                    hospitalIds.push(s.hospitalId);
                    service.hospital.push(s.hospital);
                }
            });
        }
        return service;
    };

    Work.prototype.isDeleted = function () {
        return !!this.dtime;
    };
    Work.GENDER_MALE = GENDER_MALE;
    Work.GENDER_FEMALE = GENDER_FEMALE;
    Work.STATUS_CHECKING = STATUS_CHECKING;
    Work.STATUS_DISAPPROVED = STATUS_DISAPPROVED;
    Work.STATUS_APPROVED = STATUS_APPROVED;
    Work.WORKERTYPE_FORMAL = WORKER_TYPE_FORMAL;
    Work.WORKERTYPE_INFORMAL = WORKER_TYPE_INFORMAL;

    Work.GENDER = GENDER;
    Work.STATUS = STATUS;
    Work.WORKER_TYPE = WORKER_TYPE;

    // Work.sync(); //创建表
    
    return Work;
};
