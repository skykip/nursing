function init() {
    var co = require('co');
    return co(function* () {
        var setupHospital = require('./setupHospital');
        var setupPermission = require('./setupPermission');
        var setupSetting = require('./setupSetting');
        var setupUser = require('./setupUser');
        var setupPrice = require('./setupPrice');
        var Role = require('../models').role;
        var count = yield Role.count();
        if (count == 0) {
            var result = yield setupPermission.createRolesAndPermissions();
            if (!result) {
                throw new Error("createRolesAndPermissions fail");
            }
            result = yield setupHospital.createHospitals();
            if (!result) {
                throw new Error("createHospitals fail");
            }
            result = yield setupSetting.createDefaultSettings();
            if (!result) {
                throw new Error("createDefaultSettings fail");
            }
            result = yield setupUser.createDefaultUsers();
            if (!result) {
                throw new Error("createDefaultSettings fail");
            }
            result = yield setupPrice.createDefaultPriceTemplate();
            if (!result) {
                throw new Error("createDefaultPriceTemplate fail");
            }
        }

        return true;
    }).catch(function (err) {
        console.error(err);
        return false;
    });
}

exports.init = init;
