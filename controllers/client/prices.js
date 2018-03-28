"use strict";
const co = require('co');
const _ = require('lodash');
const errors = require('../../errors');
const Price = require('../../models').price;


// 通过post请求来获取价格信息
const postQueryPrice = function(req, res) {
    console.log(req.body);
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;
    let level = req.body.level;
    let star = req.body.star;

    if (startDate && endDate && level && star) {
        Price.queryPrice(level, star, startDate, endDate).then(function(price) {
            res.jsonp(price);
        }).catch(function(e) {
            res.jsonp({'error':e});
        });
    } else {
        res.jsonp({});
    }

}



exports.postQueryPrice = postQueryPrice;