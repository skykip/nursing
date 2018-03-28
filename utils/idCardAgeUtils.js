let IdValidator = require('id-validator');
let moment = require('moment');
let GB2260 = require('id-validator/src/GB2260');

var idCardAge = function(idCardNum){
    if (!idCardNum) {
        return 0;
    }
    let Validator = new IdValidator(GB2260);
    if (!Validator.isValid(idCardNum)) {
        return 0;
    }
    let birth = Validator.getInfo(idCardNum).birth;
    let age = moment(birth, "YYYY-MM-DD").fromNow().split(" ")[0];
    return parseInt(age) || 0;
};

module.exports = idCardAge;