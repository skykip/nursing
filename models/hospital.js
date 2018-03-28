"use strict";
const moment = require('moment');
module.exports = function (sequelize, DataTypes) {
    const Hospital = sequelize.define("hospital", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: '医院名'
        },
        tel: {
            type: DataTypes.STRING,
            comment: '联系电话'
        },
        state: {
            type: DataTypes.STRING,
            comment: '省'
            
        },
        city: {
            type: DataTypes.STRING,
            comment: '市'
        },
        region: {
            type: DataTypes.STRING,
            comment: '区'
        },
        address: {
            type: DataTypes.STRING,
            comment: '详细地址'
        },
        level: {
            type: DataTypes.STRING,
            comment: '医院等级'
        },
        areacode: {//新增
            type: DataTypes.STRING,
            comment: '区域码'
        },
        lng: {//新增
            type: DataTypes.DECIMAL(10,7),
            comment: '经度'
        },
        lat: {//新增
            type: DataTypes.DECIMAL(10,7),
            comment: '纬度'
        }
        // alphabet: {
        //     type: DataTypes.STRING,
        //     comment: '城市别名'
        // }
    }, {
        comment: '医院表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: true,
        indexes: [
            {
                fields: ['state', 'city', 'region']
            }
        ]
    });
    //类方法
    Hospital.associate = function (models) {
        //Hospital.hasMany(models.work);
        //associate the models
    };
    //增加医院    
    Hospital.addHospital = function (options) {
        
        return Hospital.create(options);
    };
    //通过id删除医院
    Hospital.deleteHospitalById = function (hospitalId) {
        return sequelize.transaction(function (t) {
            return Hospital.destroy(
                {
                where: {
                    id:hospitalId
                },
                transaction: t
            }).then(function (records) {
                return "{'msg':'success'"+"删除数据:"+records+"}";
            });
        });
    };
    
    //更新医院信息
    Hospital.updateHospital = function (hospitalId,options) {
        return sequelize.transaction(function (t) {
        return Hospital.update(options,
            {
            where:{
                id:hospitalId
            },
            transaction: t
        }).then(function (result) {
            if (!result[0]) {
                throw new Error();
            }
            console.log('patch updated Hospital');
            console.log(result);
        });
        });
    };

    Hospital.queryById = function (id) {
        let hospitalId = id;
        console.log("hospitalId:"+hospitalId);
        return Hospital.findOne({
            where: {
                id: hospitalId
            }
        });
      };

    Hospital.queryByIds = function (hospitalIds) {
        return Hospital.findAll({
            where: {
                id: {
                    in: hospitalIds
                }
            }
        });
    };
    Hospital.queryByState = function (state) {
        return Hospital.findAll({
            where: {
                state: state
            }
        });
    };
    
    Hospital.queryByCity = function (city) {
        return Hospital.findAll({
            where: {
                city: city
            }
        });
    };
    Hospital.queryByRegion= function (region) {
        return Hospital.findAll({
            where: {
               region:region
            }
        });
    };
    
    Hospital.queryByStateCityRegion = function (state,city,region){
        return Hospital.findAll({
            where: {
                state: state,
                city: city,
                region:region
            }
        });
    };

    Hospital.queryAll = function (options) {
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
        //let ids = options.query.ids;
        let states = options.query.states;
        let cities = options.query.cities;
        let regions = options.query.regions;
        let areacode = options.query.areacode;
        let whereClause = {

        };
        // if (ids && ids.length) {
        //     whereClause.id = {
        //         in: ids
        //     }
        // }
        if (states && states.length) {
            whereClause.state = {
                in: states
            }
        }
        if (cities && cities.length) {
            whereClause.city = {
                in: cities
            }
        }
        if (regions && regions.length) {
            whereClause.region = {
                in: regions
            }
        }
        if (areacode && areacode.length) {
            whereClause.areacode = {
                in: areacode
            }
        }
        console.log(whereClause);
        return Hospital.findAll({
             where: whereClause,
             limit:limit,
             //attributes: ['state', 'city', 'region','ctime','utime'],
             offset: offset
        });
    };

    Hospital.queryAllHospitalName = function (options) {
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
       
        let states = options.query.states;
        let cities = options.query.cities;
        let regions = options.query.regions;
        let whereClause = {

        };
        if (states && states.length) {
            whereClause.state = {
                in: states
            }
        }
        if (cities && cities.length) {
            whereClause.city = {
                in: cities
            }
        }
        if (regions && regions.length) {
            whereClause.region = {
                in: regions
            }
        }
        console.log(whereClause);
        return Hospital.findAll({
             where: whereClause,
             limit:limit,
             attributes: ['name','id'],
             offset: offset
        });
    };
    Hospital.queryLikeHospitalName = function (options) {
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
        let name = options.query.hospitalName;
        let whereClause = {

        };
        if (name && name.length) {
            whereClause.name = {
                '$like': '%'+name+'%'
            }
            
        }
        console.log(whereClause);
        return Hospital.findAll({
             where: whereClause,
             limit:limit,
             //attributes: ['name','id'],
             offset: offset
        });
    };
    Hospital.queryAllHospitalState = function (options) {
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
       
        let states = options.query.states;
        let cities = options.query.cities;
        let regions = options.query.regions;
        let whereClause = {

        };
        if (states && states.length) {
            whereClause.state = {
                in: states
            }
        }
        if (cities && cities.length) {
            whereClause.city = {
                in: cities
            }
        }
        if (regions && regions.length) {
            whereClause.region = {
                in: regions
            }
        }
        console.log(whereClause);
        return Hospital.findAll({
             where: whereClause,
             limit:limit,
             attributes: ['state'],
             offset: offset
        });
    };

    Hospital.queryAllHospitalCity = function (options) {
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
       
        let states = options.query.states;
        let whereClause = {

        };

        if (states && states.length) {
            whereClause.state = {
                in: states
            }
        }

        console.log(whereClause);
        return Hospital.findAll({
             where: whereClause,
             limit:limit,
             attributes: ['city'],
             offset: offset
        });
    };

    Hospital.queryAllRegions = function (options) {
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
       
        let states = options.query.states;
        let cities = options.query.cities;
        let whereClause = {

        };

        if (states && states.length) {
            whereClause.state = {
                in: states
            }
        }

        if (cities && cities.length) {
            whereClause.city = {
                in: cities
            }
        }

        console.log(whereClause);
        return Hospital.findAll({
             where: whereClause,
             limit:limit,
             attributes: ['region'],
             offset: offset
        });
    };

    Hospital.queryAllHospitalRegion = function (options) {
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
       
        let states = options.query.states;
        let cities = options.query.cities;
        let whereClause = {

        };

        if (states && states.length) {
            whereClause.state = {
                in: states
            }
        }

        if (cities && cities.length) {
            whereClause.city = {
                in: cities
            }
        }

        console.log(whereClause);
        return Hospital.findAll({
             where: whereClause,
             limit:limit,
             attributes: ['name','region'],
             offset: offset
        });
    };

    Hospital.queryAllHospitalLngLat= function () {
        // let limit = options.pagination.limit;
        // let offset = (options.pagination.page - 1) * limit;
       
        // let states = options.query.states;
        // let cities = options.query.cities;
        // let whereClause = {

        // };

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

        // console.log(whereClause);
        return Hospital.findAll({
         attributes: ['lng','lat','id']
        });
    };
    
    Hospital.queryHospitalByIdlnglat = function (id) {
        return Hospital.findOne({
            where: {
                id: id,
            },
            attributes: ['name','id']
        });
      };

    Hospital.findStateCityRegion = function (state,city,region) {
        return Hospital.findAll({
            where: {
                state:state,
                city:city,
                region:region
            }
            // attributes: ['state', 'city', 'region'],
            // group: ['state', 'city', 'region']
        });
    };



    //实例方法
    Hospital.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let excludeValue = ['ctime', 'utime', 'dtime','id'];
        values.hospital_id = values.id; 
        let hospitalcreattime = moment(values.ctime).format('YYYY-MM-DD HH:mm:ss');
        values.hospitalcreattime = hospitalcreattime;
        values = _.omit(values, excludeValue);
        return values;
    }
    // Hospital.sync(); //创建表
      
    return Hospital;
};