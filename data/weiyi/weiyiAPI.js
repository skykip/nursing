var request = require('sync-request');
var cheerio = require('cheerio');

var getProvinceAndCity = function () {
    var result = {};
    var provinces = getProvinces();
    provinces.forEach(function (province) {
        var cities = getCities(province.id);
        var provinceCity = {};
        cities.forEach(function (city) {
            provinceCity[city.name] = {
                id: city.id,
                name: city.name
            }
        });
        result[province.name] = {
            id: province.id,
            name: province.name,
            cities: provinceCity
        };
    });
    return result;
};

var getProvinces = function () {
    var url = "https://www.guahao.com/json/white/area/provinces";
    var body = request('GET', url).getBody().toString();
    body = JSON.parse(body);
    var provinces = [];
    body.forEach(function (data) {
        var province = {};
        province.id = data.value;
        province.name = data.text;
        provinces.push(province);
    });
    return provinces;
};

var getCities = function (provinceId) {
    var url = "https://www.guahao.com/json/white/area/citys";
    var qs = {
        provinceId: provinceId
    };
    var body = request('GET', url, {qs: qs}).getBody().toString();
    body = JSON.parse(body);
   // console.log(body);
    var cities = [];
    body.forEach(function (data) {
        cities.push({
            id: data.value,
            name: data.text
        });
    });
    return cities;
};


var getHospitals = function (province, city, pageNo) {
    var cityData;
    try {
        cityData = require('./city.json');
    } catch (e) {
        cityData = getProvinceAndCity();
    }
    if (!cityData) {
        return;
    }
    var provinceId = cityData[province].id;
    var cityId = cityData[province].cities[city];
    if (!provinceId) {
        provinceId = "all";
    }
    if (!cityId) {
        cityId = "all";
    }
    var url = "https://www.guahao.com/hospital/areahospitals";
    if (city == null) city = "不限";
    var qs = {
        sort: "region_sort",
        ipIsShanghai: false,
        fg: 0,
        c: city,
        p: province,
        hl: "all",
        ht: "all",
        hk: "all",
        o: "all",
        pi: provinceId,
        ci: cityId,
        pageNo: pageNo
    };
    var body = request('GET', url, {qs: qs}).getBody().toString();
    var hospitals = parseHospitals(body);
    return hospitals;
};

var parseHospitals = function (body) {
    var hospitals = [];
    var $ = cheerio.load(body);

    var hos_ul = $('.hos_ul li').each(function (index, element) {
        var addr = $(this).find("dd .addr span").attr("title");
        var tel = $(this).find("dd .tel span").attr("title");
        var name = $(this).find("dl dt a").attr("title");
        var level = $(this).find("dl dt em").text();
        hospitals.push({
            name: name,
            address: addr,
            level: level,
            tel: tel
        })
    });
    return hospitals;
};

var getAllHospitals = function (province, city) {
    var hospitals = [];
    for (var i = 1; i < 2; i++) {
        var hos = getHospitals(province, city, i);
        if (hos.length == 0) {
            break;
        }
        hospitals = hospitals.concat(hos);
    }
    return hospitals;
};

var saveProvinceCityToFile = function () {
    var data = getProvinceAndCity();
    data = JSON.stringify(data);
    var fs = require('fs');
    fs.writeFile("./city.json", data, function (err) {});
};

exports.getAllHospitals = getAllHospitals;