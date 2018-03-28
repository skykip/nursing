var weiyi = require('./../data/weiyi/weiyiAPI');
var Hospital = require('../models/index').hospital;
var co = require('co');

exports.createHospitals = function () {
    console.log("医院");
    var province = "贵州";
    var city = "贵阳";
    var hospitals = weiyi.getAllHospitals(province, city);
    console.log(hospitals);
    var stateCode;
    var cityCode;
    hospitals.forEach(function (hospital) {
        hospital['state'] = province;
        hospital['city'] = city;
    });
    return co(function*() {
        var deleteCount = yield Hospital.destroy({
            where: {}
        });
        var result = yield Hospital.bulkCreate(hospitals);
        console.log("createHospitals ok, size=" + result.length);
        return true;
    }).catch(function (err) {
        console.log("createHospitals fail, err=", err);
        return false;
    });
};