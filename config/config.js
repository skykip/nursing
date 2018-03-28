"use strict";
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config-' + env +'.json');
module.exports = config;
