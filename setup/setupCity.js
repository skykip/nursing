var citiesJson = null;
var City = require('../models/index').city;
var co = require('co');

function setupCities() {
    var cities = [];
    citiesJson.province.forEach(function (province) {
        var provinceName = province.name;
        if (!province.city) {
            return;
        }
        province.city.forEach(function (city) {
            var cityName = city.name;
            if (!city.county) {
                var c = {
                    province: provinceName,
                    city: cityName
                };
                cities.push(c);
                return;
            }
            city.county = [].concat(city.county);
            city.county.forEach(function (county) {
                var countyName = county.name;
                var c = {
                    province: provinceName,
                    city: cityName,
                    county: countyName
                };
                cities.push(c);
            });
        });
    });

    co(function* () {
        var rows = yield City.bulkCreate(cities);
    }).catch(function (err) {
        console.error(err);
    });
}
exports.setupCities = setupCities;