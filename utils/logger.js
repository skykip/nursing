"use strict";
const winston = require('winston');
// winston.setLevels({
//     debug: 0,
//     info: 1,
//     verbose: 2,
//     warn: 3,
//     error: 4
// });
winston.addColors({
    debug: 'green',
    info: 'cyan',
    silly: 'magenta',
    warn: 'yellow',
    error: 'red'
});
winston.add(winston.transports.File, {
    filename: 'logs/all.log',
    colorize: true,
    timestamp: function () {
        let moment = require('moment');
        return moment().format('YYYY-MM-DD HH:mm:ss:SSS')
    },
    level: 'verbose'
});
module.exports = winston;
