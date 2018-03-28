"use strict";
const moment = require('moment');
module.exports = function (sequelize, DataTypes) {
    const Area = sequelize.define("area", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        alphabet: {
            type: DataTypes.STRING,
            comment: '城市首字母'
        },
        areacode: {
            type: DataTypes.STRING,
            comment: '地区码'
        }
        // lng: {
        //     type: DataTypes.DECIMAL,
        //     comment: '经度'
        // },
        // lat: {
        //     type: DataTypes.DECIMAL(10,7),
        //     comment: '维度'
        // }
    }, {
        comment: '地区表',
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
    Area.associate = function (models) {
        //Area.hasMany(models.work);
        //associate the models
    };
    //增加地区   
    Area.addArea = function (areaState,areaCity,areaRegion,areaAlphabet,areaAreaCode,areaLng,areaLat) 
    {
        return Area.create({
            state:areaState,
            city:areaCity,
            region:areaRegion,
            alphabet:areaAlphabet,
            areacode:areaAreaCode,
            lng:areaLng,
            lat:areaLat
        });
    };
    //通过id删除地区
    Area.deleteAreaById = function (areaId) {
        return sequelize.transaction(function (t) {
            return Area.destroy(
                {
                where: {
                    id:areaId
                },
                transaction: t
            }).then(function (records) {
                return "{'msg':'success'"+"删除数据:"+records+"}";
            });
        });
    };
    
    //更新地区信息
    Area.updateArea = function (areaId,areaState,areaCity,areaRegion,areaAlphabet,areaAreaCode,areaLng,areaLat) {
        return sequelize.transaction(function (t) {
        return Area.update({
            state:areaState,
            city:areaCity,
            region:areaRegion,
            alphabet:areaAlphabet,
            areacode:areaAreaCode,
            lng:areaLng,
            lat:areaLat
        },{
            where:{
                id:areaId
            },
            transaction: t
        }).then(function (result) {
            if (!result[0]) {
                throw new Error();
            }
            console.log('patch updated Area');
            console.log(result);
        });
        });
    };

    Area.queryById = function (id) {
        let areaId = id;
        console.log("areaId:"+areaId);
        return Area.findOne({
            where: {
                id: areaId
            }
        });
      };

    Area.queryByIds = function (areaIds) {
        return Area.findAll({
            where: {
                id: {
                    in: areaIds
                }
            }
        });
    };
    Area.queryByState = function (state) {
        return Area.findAll({
            where: {
                state: state
            }
        });
    };
    
    Area.queryByCity = function (city) {
        return Area.findAll({
            where: {
                city: city
            }
        });
    };
    Area.queryByRegion= function (region) {
        return Area.findAll({
            where: {
               region:region
            }
        });
    };
    
    Area.queryByStateCityRegion = function (state,city,region){
        return Area.findAll({
            where: {
                state: state,
                city: city,
                region:region
            }
        });
    };

    Area.queryAll = function (options) {
        let limit = options.pagination.limit;
        let offset = (options.pagination.page - 1) * limit;
        //let ids = options.query.ids;
        let states = options.query.states;
        let cities = options.query.cities;
        let regions = options.query.regions;
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
        console.log(whereClause);
        return Area.findAll({
             where: whereClause,
             limit:limit,
             attributes: ['city', 'region','alphabet','areacode'],
             offset: offset
        });
    };

    Area.queryAllAreaState = function (options) {
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
        return Area.findAll({
             where: whereClause,
             limit:limit,
             attributes: ['state'],
             offset: offset
        });
    };

    Area.queryAllAreaCity = function (options) {
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
        return Area.findAll({
             where: whereClause,
             limit:limit,
             attributes: ['city'],
             offset: offset
        });
    };

    Area.queryAllAreaRegion = function (options) {
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
        return Area.findAll({
             where: whereClause,
             limit:limit,
             attributes: ['name','region'],
             offset: offset
        });
    };
    
  



    //实例方法
    Area.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let excludeValue = ['ctime', 'utime', 'dtime','id'];
        values.area_id = values.id; 
        //let areacreattime = moment(values.ctime).format('YYYY-MM-DD');
        //values.areacreattime = areacreattime;
        values = _.omit(values, excludeValue);
        return values;
    }
    // Area.sync(); //创建表
      
    return Area;
};