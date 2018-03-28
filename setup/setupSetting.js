var Settings = require('../utils/settings');
var setting = require('../config/config');
var co = require('co');
exports.createDefaultSettings = function () {
    return co(function*() {
        yield Settings.setUrl(setting.url);
        yield Settings.setServiceConfig(setting.serviceConfig);
        yield Settings.setPercentageConfig({company_formal: 0.15, company_informal: 0.1, hospital: 0.05});
        yield Settings.setSalaryScheduleConfig({formal: 1});
        yield Settings.setFormalSalaryConfig({base: 1500, days: 10});
        console.log("createDefaultSettings ok");
        return true;
    }).catch(function (err) {
        console.log(err);
        return false;
    });
};
