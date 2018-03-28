"use strict";

let moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    const Price = sequelize.define("price", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: '模版名'
        },
        prices: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: '模版数据'
        }
        //},
        //basePrice: {
        //    type: DataTypes.FLOAT,
        //    allowNull: false,
        //    validate: {min: 0}
        //},
        //priceRatio: {
        //    type: DataTypes.STRING,
        //    allowNull: false
        //}
    }, {
        comment: '价格模版表',
        engine: "InnoDB ROW_FORMAT = DYNAMIC",
        rowFormat: "DYNAMIC",
        createdAt: 'ctime',
        updatedAt: 'utime',
        deletedAt: 'dtime',
        paranoid: false
    });

    //类方法
    Price.associate =  function (models) {
        let Work = models.work;
        Price.hasMany(Work);
    }

    //通过护工等级，星级，开始时间和结束时间来查看价格
    Price.queryPrice = function(level, star, startDate, endDate) {
        let startMoment = moment(startDate, "YYYY-MM-DD");
        let endMoment = moment(endDate, "YYYY-MM-DD");
        let coverDays = endMoment.diff(startMoment, "days") + 1;
                    
        return Price.findAll().then(function(prices) {
            let pricesObj = {};

            for (let i = 0; i < prices.length; ++i) {
                let price = prices[i];
                //console.log(price.prices);
                let priceRow = JSON.parse(price.prices);
                for (let attr in priceRow) {
                    pricesObj[attr] = priceRow[attr];
                }
            }

            let key = 'dayNightlevel' + level + '_' + star;
            let pricePerDay = pricesObj[key]*1000;

            
            let res;
            
            if (coverDays > 0) {
                res = {'total': pricePerDay * coverDays, 'pricePerDay': pricePerDay};
            } else {
                res = {'total': 0, 'pricePerDay': pricePerDay};
            }
            

            return res;
        });
    }

    //通过护工ID，开始时间和结束时间来查看价格
    Price.queryPriceByWorkId = function(workId, startDate, endDate) {
        let Work = sequelize.model('work');
        return Work.queryById(workId).then(function(work){
            if (work) {
                //console.log(work);
                let level = work.level;
                let star = work.star;
                return Price.queryPrice(level, star, startDate, endDate)
            } else {
                return null;
            }
            
        })
    }

    Price.queryAll = function () {
        return Price.findAll().then(function (prices) {
            let readablePrices = [];
            for (let i = 0; i < prices.length; ++i) {
                let price = prices[i];
                let readablePrice = {};
                let p = JSON.parse(price.prices);
                readablePrice.id = price.id;
                readablePrice.name = price.name;
                //readablePrice.basePrice = price.basePrice;
                //readablePrice.daydependent = p.daydependent;
                //readablePrice.dayindependent = p.dayindependent;
                //readablePrice.nightdependent = p.nightdependent;
                //readablePrice.nightindependent = p.nightindependent;
                //readablePrice.dayNightdependent = p.dayNightdependent;
                //readablePrice.dayNightindependent = p.dayNightindependent;

                readablePrice.daylevel1_1 = p.daylevel1_1;
                readablePrice.daylevel1_2 = p.daylevel1_2;
                readablePrice.daylevel1_3 = p.daylevel1_3;
                readablePrice.daylevel1_4 = p.daylevel1_4;
                readablePrice.daylevel1_5 = p.daylevel1_5;

                readablePrice.daylevel2_1 = p.daylevel2_1;
                readablePrice.daylevel2_2 = p.daylevel2_2;
                readablePrice.daylevel2_3 = p.daylevel2_3;
                readablePrice.daylevel2_4 = p.daylevel2_4;
                readablePrice.daylevel2_5 = p.daylevel2_5;

                readablePrice.daylevel3_1 = p.daylevel3_1;
                readablePrice.daylevel3_2 = p.daylevel3_2;
                readablePrice.daylevel3_3 = p.daylevel3_3;
                readablePrice.daylevel3_4 = p.daylevel3_4;
                readablePrice.daylevel3_5 = p.daylevel3_5;

                readablePrice.nightlevel1_1 = p.nightlevel1_1;
                readablePrice.nightlevel1_2 = p.nightlevel1_2;
                readablePrice.nightlevel1_3 = p.nightlevel1_3;
                readablePrice.nightlevel1_4 = p.nightlevel1_4;
                readablePrice.nightlevel1_5 = p.nightlevel1_5;

                readablePrice.nightlevel2_1 = p.nightlevel2_1;
                readablePrice.nightlevel2_2 = p.nightlevel2_2;
                readablePrice.nightlevel2_3 = p.nightlevel2_3;
                readablePrice.nightlevel2_4 = p.nightlevel2_4;
                readablePrice.nightlevel2_5 = p.nightlevel2_5;

                readablePrice.nightlevel3_1 = p.nightlevel3_1;
                readablePrice.nightlevel3_2 = p.nightlevel3_2;
                readablePrice.nightlevel3_3 = p.nightlevel3_3;
                readablePrice.nightlevel3_4 = p.nightlevel3_4;
                readablePrice.nightlevel3_5 = p.nightlevel3_5;

                readablePrice.dayNightlevel1_1 = p.dayNightlevel1_1;
                readablePrice.dayNightlevel1_2 = p.dayNightlevel1_2;
                readablePrice.dayNightlevel1_3 = p.dayNightlevel1_3;
                readablePrice.dayNightlevel1_4 = p.dayNightlevel1_4;
                readablePrice.dayNightlevel1_5 = p.dayNightlevel1_5;

                readablePrice.dayNightlevel2_1 = p.dayNightlevel2_1;
                readablePrice.dayNightlevel2_2 = p.dayNightlevel2_2;
                readablePrice.dayNightlevel2_3 = p.dayNightlevel2_3;
                readablePrice.dayNightlevel2_4 = p.dayNightlevel2_4;
                readablePrice.dayNightlevel2_5 = p.dayNightlevel2_5;

                readablePrice.dayNightlevel3_1 = p.dayNightlevel3_1;
                readablePrice.dayNightlevel3_2 = p.dayNightlevel3_2;
                readablePrice.dayNightlevel3_3 = p.dayNightlevel3_3;
                readablePrice.dayNightlevel3_4 = p.dayNightlevel3_4;
                readablePrice.dayNightlevel3_5 = p.dayNightlevel3_5;


                readablePrices.push(readablePrice);
            }
            return readablePrices;
        });
    };
    Price.queryById = function (priceId) {
        return Price.findOne({
            where: {
                id: priceId
            }
        });
    };

    //实例方法
    Price.prototype.toJSON = function () {
        let _ = require('lodash');
        let values = this.dataValues;
        let excludeValue = ['ctime', 'utime', 'dtime'];
        values = _.omit(values, excludeValue);
        return values;
    };
    Price.prototype.calcDayPrice = function (options) {
        //var nursingTime = options.nursingTime;
        //var dependentLevel = options.dependentLevel;
        //
        //var price = +this.basePrice;
        //var ratio = this.getPriceRatio();
        //var nursingTimeRatio = ratio.nursingTimes[nursingTime];
        //var dependentLevelRatio = ratio.dependentLevels[dependentLevel];
        //price *= (1 + nursingTimeRatio + dependentLevelRatio);
        //price = Math.round(price * 100) / 100;
        //return price;
        let prices = JSON.parse(this.prices);
        console.log("_______", options.nursingTime.concat(options.dependentLevel));
        return prices[options.nursingTime.concat(options.dependentLevel)];
    };

    Price.prototype.calcPrice = function (options) {
        let price = this.calcDayPrice(options);
        console.log("calcDayPrice " + price);
        let serviceDays = options.serviceDays;
        price *= serviceDays;
        price = Math.round(price * 100) / 100;
        return price;
    };
    return Price;
};