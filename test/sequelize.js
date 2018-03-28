"use strict";

const Sequelize = require('sequelize');
const config = require('./config/config')["sequelize"];

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}



var co = require('co');
co(function* () {
  //添加数据
//   User.create({
//     userId: 23,
//     userName: '老杨',
//     updateTime: '2016-01-22 18:37:22'
// });
// code here
 console.log("异步模块测试！"+User);
}).catch(function(e) {
console.log(e);
});
//访问数据库
