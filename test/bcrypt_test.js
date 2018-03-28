"use strict";
const co = require('co');
const bcrypt = require('bcryptjs');
var Promise = require('bluebird');
const errors = require('../errors');
var md5 = require('blueimp-md5');

const bcryptGenSalt = Promise.promisify(bcrypt.genSalt);
const bcryptHash = Promise.promisify(bcrypt.hash);
const bcryptCompare = Promise.promisify(bcrypt.compare);

function genPasswordHash(password) {
    return bcryptGenSalt().then(function (salt) {
       console.log("salt"+salt);
        return bcryptHash(password, salt);
    });
}

co(function* () {
// code here
genPasswordHash(md5('CALLCENTER')).then(function (hash) {
             console.log("hash"+bcryptHash);
             console.log(md5('CALLCENTER'));
       //     done();
        }).catch(function (err) {
            return false;
        })
 //console.log("测试bcryptjs！"+genPasswordHash("123123"));
}).catch(function(e) {
console.log(e);
});
