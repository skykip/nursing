/**
 * setupPrice.js
 * Created by haroldsong on 16/5/1.
 * Copyright (c) 2016 Tencent Inc. All rights reserved.
 * Description:
 */

var co = require('co');
var moment = require('moment');
var Price = require('../models').price;
var Order = require('../models').order;
var Work = require('../models').work;
var OrderStatus = require('../models').orderStatus;
var OrderWorks = require('../models').orderWorks;
var Hospital = require('../models').hospital;
var User = require('../models').user;

exports.createDefaultPriceTemplate = function () {
    return co(function* () {
        //随机订单号
        // let date = moment().format("YYYYMMDDHHMMSSSSS");
        // let random = Math.random().toString().slice(2, 6);
        // let tradeNumData = date + random;
        // //订单假数据
        // yield Order.create({
        //     tradeNum: tradeNumData,
        //     status: "progressing",
        //     startDate: "2016-07-05T16:00:00.000Z",
        //     patientGender: "male",
        //     workerGender: "male",
        //     dependentLevel: "level1",
        //     nursingTime: "day",
        //     endDate: "2016-07-08T15:59:59.000Z",
        //     msg: null,
        //     description: null,
        //     price: "0.10",
        //     dayPrice: "0.04",
        //     place: null,
        //     contract: null,
        //     createdAt: "2016-07-06T04:46:31.000Z",
        //     payer: null,
        //     actualStartDate: "2016-07-05T16:00:00.000Z",
        //     actualEndDate: "2016-07-08T15:59:59.000Z",
        //     amount: "0.10"
        // });

          //用户假数据
        //   yield User.create({
        //     openId: "oDAEOv4aV21upSgx7JLZPbhdEYbU",
        //     username: "oDAEOv4aV21upSgx7JLZPbhdEYbU@nursingWork",
        //     birthday:"1997-12-07",
        //     name: "晖",
        //     phoneNum: "13985160123",
        //     gender: "male",
        //     avatar: "http://image.baidu.com/search/detail?ct=503316480&z=0&ipn=false&word=%E5%A4%B4%E5%83%8F&hs=0&pn=3&spn=0&di=169813820110&pi=0&rn=1&tn=baiduimagedetail&is=0%2C0&ie=utf-8&oe=utf-8&cl=2&lm=-1&cs=547138142%2C3998729701&os=1840643701%2C1875487181&simid=3533872911%2C354593644&adpicid=0&lpn=0&ln=30&fr=ala&fm=&sme=&cg=head&bdtype=0&oriquery=%E5%A4%B4%E5%83%8F&objurl=http%3A%2F%2Fwww.hnlywz.com%2Fa%2Fupload%2Fbd118381382.jpg&fromurl=ippr_z2C%24qAzdH3FAzdH3Fooo_z%26e3Bigsyoz_z%26e3Bv54AzdH3F8da9bld_z%26e3Bip4s&gsm=0",
        //     //createdById: null
        //   });

        //护工假数据
        // yield Work.create({
        //     name: "李兴益",
        //     gender: "male",
        //     phoneNum: "18785163923",
        //     status: "approved",
        //     idCardNum: "522528197401032038",
        //     description: "",
        //     avatar: null,
        //     exp: 5,
        //     workType: "formal",
        //     age: 43
        // });

        //医院假数据
        yield Hospital.create({
            name: "中山大学附属第三医院天河医院",
            tel: "020-85253333",
            state: "广东省",
            city: "广州市",
            region: null,
            address: "广东省广州市天河区天河路600号",
            level: "三级甲等"
        });
        yield Hospital.create({
            name: "贵州省人民医院",
            tel: "020-85253333",
            state: "贵州省",
            city: "贵阳市",
            region: "云岩区",
            address: "贵州省贵阳市云岩区118号",
            level: "三级甲等"
        });

        //订单状态假数据
        // yield OrderStatus.create({
        //     status: "unpaid",
        //     changedAt: "2016-07-06T04:46:31.000Z",
        //     ctime: "2016-07-06T04:46:31.000Z",
        //     utime: "2016-07-06T04:46:31.000Z",
        //     orderId: 1,
        //     userId: 1
        // });

        // yield Price.create({
        //     name: '贵阳价格模版',
        //     prices: JSON.stringify({normal: 100})
        // });
        // yield Price.create({
        //     name: '广州价格模版',
        //     prices: JSON.stringify({normal: 200})
        // });
        // yield Price.create({
        //     name: '深圳价格模版',
        //     prices: JSON.stringify({normal: 300})
        // });
        
        // var name = "初级护工工资模版";
        // var prices = {
        //    daylevel1_1: 0.1,
        //    daylevel1_2: 0.11,
        //    daylevel1_3: 0.12,
        //    daylevel1_4: 0.13,
        //    daylevel1_5: 0.14,
        //    nightlevel1_1: 0.1,
        //    nightlevel1_2: 0.11,
        //    nightlevel1_3: 0.12,
        //    nightlevel1_4: 0.13,
        //    nightlevel1_5: 0.14,
        //    dayNightlevel1_1: 0.15,
        //    dayNightlevel1_2: 0.16,
        //    dayNightlevel1_3: 0.17,
        //    dayNightlevel1_4: 0.18,
        //    dayNightlevel1_5: 0.19
        // };
        
        
        // var price1 = yield Price.create({
        //    name: name,
        //    prices: JSON.stringify(prices)
        // });
        
        // name = "中级护工工资模版";
        // prices = {
        //     daylevel2_1: 0.12,
        //     daylevel2_2: 0.13,
        //     daylevel2_3: 0.14,
        //     daylevel2_4: 0.15,
        //     daylevel2_5: 0.16,
        //     nightlevel2_1: 0.12,
        //     nightlevel2_2: 0.13,
        //     nightlevel2_3: 0.14,
        //     nightlevel2_4: 0.15,
        //     nightlevel2_5: 0.16,
        //     dayNightlevel2_1: 0.2,
        //     dayNightlevel2_2: 0.22,
        //     dayNightlevel2_3: 0.24,
        //     dayNightlevel2_4: 0.26,
        //     dayNightlevel2_5: 0.28
        // };
        
        // var price2 = yield Price.create({
        //    name: name,
        //    prices: JSON.stringify(prices)
        // });
        
        // name = "高级护工工资模版";
        // prices = {
        //     daylevel3_1: 0.14,
        //     daylevel3_2: 0.15,
        //     daylevel3_3: 0.16,
        //     daylevel3_4: 0.17,
        //     daylevel3_5: 0.18,
        //     nightlevel3_1: 0.14,
        //     nightlevel3_2: 0.15,
        //     nightlevel3_3: 0.16,
        //     nightlevel3_4: 0.17,
        //     nightlevel3_5: 0.18,
        //     dayNightlevel3_1: 0.25,
        //     dayNightlevel3_2: 0.27,
        //     dayNightlevel3_3: 0.29,
        //     dayNightlevel3_4: 0.32,
        //     dayNightlevel3_5: 0.35
        // };
        
        // var price3 = yield Price.create({
        //    name: name,
        //    prices: JSON.stringify(prices)
        // });
        console.log("createDefaultPriceTemplate ok");
        
        return true;
    }).catch(function(err) {
        console.log(err);
        return false
    });
};