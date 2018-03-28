"use strict";
const Option = require('../models').option;

const KEY_URL = "KEY_URL";
const KEY_SERVICE_CONFIG = "KEY_SERVICE_CONFIG";
const KEY_PERCENTAGE = "KEY_PERCENTAGE";
const KEY_SALARY_SCHEDULE = "KEY_SALARY_SCHEDULE";
const KEY_SALARY_FORMAL = "KEY_SALARY_FORMAL";

let Settings = {
    getUrl: function () {
        return Option.getString(KEY_URL);
    },
    setUrl: function (url) {
        return Option.setString(KEY_URL, url);
    },
    getServiceConfig: function () {
        return Option.getObject(KEY_SERVICE_CONFIG);
    },
    setServiceConfig: function (config) {
        return Option.setObject(KEY_SERVICE_CONFIG, config);
    },
    setPercentageConfig: function (config) {
        return Option.setObject(KEY_PERCENTAGE, config);
    },
    setSalaryScheduleConfig: function (config) {
        return Option.setObject(KEY_SALARY_SCHEDULE, config);
    },
    setFormalSalaryConfig: function(config) {
        return Option.setObject(KEY_SALARY_FORMAL, config);
    }
};

module.exports = Settings;