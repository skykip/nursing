"use strict";
const co = require('co');
const bcrypt = require('bcryptjs');
const Promise = require('bluebird');
const moment = require('moment');
const errors = require('../errors');

const bcryptGenSalt = Promise.promisify(bcrypt.genSalt);
const bcryptHash = Promise.promisify(bcrypt.hash);
const bcryptCompare = Promise.promisify(bcrypt.compare);

function genPasswordHash(password) {
    return bcryptGenSalt().then(function (salt) {
        return bcryptHash(password, salt);
    });
}

const GENDER_MALE = 'male';
const GENDER_FEMALE = 'female';
const GENDER_UNKNOWN = 'unknown';

const GENDER = [
    GENDER_UNKNOWN,
    GENDER_FEMALE,
    GENDER_MALE
];

module.exports = function (sequelize, DataTypes) {

    const User = sequelize.define("user", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        openId: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: {
                msg: errors.types.TYPE_API_USER_DUPLICATED_OPEN_ID
            },
            comment: '微信OpenId'
        },
        wechatname: {//新增
            type: DataTypes.STRING,
            comment: '微信号'
        },
        usertype: {
            type: DataTypes.STRING,
            comment: '会员类型'
        },
        username: {
            type: DataTypes.STRING(100),
            comment: '用户名',
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            comment: '登陆密码'
        },
        name: {
            type: DataTypes.STRING,
            comment: '名字'
        },
        birthday:{
            type: DataTypes.STRING,
            allowNull: true,
            comment: '生日'
        },
        phoneNum: {
            type: DataTypes.STRING(32),
            comment: '手机号码'
        },
        gender: {
            type: DataTypes.ENUM,
            values: GENDER,
            comment: '性别'
        },
        avatar: {
            type: DataTypes.STRING(2083),
            validate: {
                isUrl: {
                    msg: 'Invalid avatar'
                }
            },
            allowNull: true,
            comment: '头像'
        }
    }, {
        comment: '用户表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: true,
        indexes: [
            {
                fields: ['openId']
            },
            {
                fields: ['username']
            },
            {
                fields: ['phoneNum']
            }
        ],
        setterMethods: {
            password: function (value) {
                if (!User.checkPassword(value)) {
                    throw new Error("Password invalid");
                }
                this.setDataValue('password', value);
            }
        }
    });

    // 类方法
    User.checkPassword = function (password) {
        if (!password) {
            return false;
        }
        if (typeof password !== 'string') {
            return false;
        }
        if (!password.match(/[a-zA-Z0-9_!@#$%^&*()]{5,32}/)) {
            return false;
        }
        return true;
    };

    User.associate = function (models) {
        User.belongsTo(User, {
            as: 'createdBy'
        });
        User.hasOne(models.work);
        User.hasOne(models.supervision);
        User.hasOne(models.admin);
    };

    User.queryAll = function (options) {
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;

        let userName =  options.query.userName;
        let phoneNum = options.query.phoneNum ;
        let wechatName = options.query.wechatName ;
        let startTime = options.query.startTime  ;
        let endTime = options.query.endTime  ;
        let states = options.query.states;
        let cities = options.query.cities;
        let regions = options.query.regions;
        let whereClause = {};
        if (userName && userName.length) {
            whereClause.username = {
                '$like': '%'+userName+'%'
            }
        }
        if (phoneNum && phoneNum.length) {
            whereClause.phoneNum = {
                '$like': '%'+phoneNum+'%'
            }
        }
        if (wechatName && wechatName.length) {
            whereClause.wechatname = {
                '$like': '%'+wechatName+'%'
            }
        }
        if (startTime && startTime.length) {
            whereClause.ctime = {
                in: startTime
            }
        }
        if (endTime && endTime.length) {
            whereClause.ctime = {
                in: endTime
            }
        }
        // if (states && states.length) {
        //     whereClause.state = {
        //         in: states
        //     }
        // }
        // if (cities && cities.length) {
        //     whereClause.city = {
        //         in: cities
        //     }
        // }
        // if (regions && regions.length) {
        //     whereClause.region = {
        //         in: regions
        //     }
        // }
        return User.findAll({
            where: whereClause,
             limit:limit,
             //attributes: ['state', 'city', 'region','ctime','utime'],
             offset: offset
        });
    };

    User.queryById = function (id) {
        return User.find({
            where: {
                id: id
            }
        });
    };
    User.queryByPhoneNum = function (phoneNum) {
        return User.find({
            where: {
                phoneNum: phoneNum
            }
        });
    };

    User.queryByName = function (name) {
        return User.find({
            where: {
                name: name
            }
        });
    };

    User.queryByUsername = function (username) {
        return User.findOne({
            where: {
                username: username
            }
        });
    };

    User.queryByOpenId = function (openId) {

        return User.findOne({
            where: {
                openId: openId
            }
        });
    };

    User.updateById = function(userId,name,birthday,gender,avatar){
        return sequelize.transaction(function (t) {
            return User.update({
                name: name,
                birthday: birthday,
                gender: gender,
                avatar: avatar
            },{
                where:{
                    id:userId
                },
                transaction: t
            }).then(function (result) {
                if (!result[0]) {
                    throw new Error();
                }
                console.log('updated user');
                console.log(result);
            });
        });
    }

    //实例方法
    User.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        values.user_id = values.id; 
        let usercreattime = moment(values.ctime).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
        values.usercreattime = usercreattime;
        let excludeValue = ['ctime','utime', 'dtime', 'password','id'];
        values = _.omit(values, excludeValue);
        return values;
    };

    User.prototype.comparePassword = function (password) {
        return bcryptCompare(password, this.password);
    };

    User.prototype.canWork = function () {
        let _this = this;
        return co(function*() {
            let work = yield _this.getWork();
            return work !== null;
        }).catch(function (err) {
            console.log(err);
            return false;
        });
    };

    User.prototype.canSupervise = function () {
        let _this = this;
        return co(function*() {
            let supervision = yield _this.getSupervision();
            return supervision !== null;
        }).catch(function (err) {
            return false;
        });
    };

    let hashPasswordHook = function (instance, options) {
        if (!instance.changed('password')) return false;
        return genPasswordHash(instance.get('password')).then(function (hash) {
                instance.set('password',hash);
            }).catch(function (err) {
                console.log(err);
            })
    };
    User.beforeCreate(hashPasswordHook);
    User.beforeUpdate(hashPasswordHook);

    User.GENDER_MALE = GENDER_MALE;
    User.GENDER_FEMALE = GENDER_FEMALE;
    User.GENDER_UNKNOWN = GENDER_UNKNOWN;
    User.GENDER = GENDER;

    // User.sync(); //创建表

    return User;
};
