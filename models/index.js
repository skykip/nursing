"use strict";
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const config = require('../config/config')["sequelize"];
const db = {};
let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password,config);
}
//在index目录下把所有的model实体全都读取进来放到db中
fs.readdirSync(__dirname).filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    }).forEach(function (file) {
        let model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// sequelize.sync({force: false}).then(function() {
//     console.log("Server successed to start");
// }).catch(function(err){
//     console.log("Server failed to start due to error: %s", err);
// });
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
