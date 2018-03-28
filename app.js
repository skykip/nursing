"use strict";
const express = require('express');
const app = express();
const path = require('path');
const favicon = require('serve-favicon'); //远程获取网站favicon
const logger = require('morgan');
const winston = require('winston');
const expressWinston = require('express-winston');
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
//const formidable = require('formidable');
const validator = require('express-validator');
const methodOverride = require('method-override');
const i18n = require('i18n');

const config = require('./config/config');
const errors = require('./errors');
const identify = require('./lib/identify.js');


//分页
const pagination = require('./utils/pagination');

//路由
const index = require('./routes/index');
const test = require('./routes/test/index');
const adminRouter = require('./routes/admin/index');
const clientRouter = require('./routes/client/index');

const wechat = require('./routes/wechat/wechat');
const wechatAuth = require('./routes/wechat/wechatAuth');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
i18n.configure({
    locales: ['zh'],
    defaultLocale: 'zh',
    directory: __dirname + '/locales',
    objectNotation: true,
    api: {
        '__': 't',
        '__n': 'tn'
    }
});

app.set('trust proxy', ['loopback']);
app.use(i18n.init);
app.use(logger('dev'));
//request logs
app.use(expressWinston.logger({
    transports: [
        new winston.transports.DailyRotateFile({
            filename: './logs/request/req.log',
            json: true,
            colorize: true
        })
    ],
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorStatus: true,
    ignoreRoute: function (req, res) {
        return false;
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));
app.disable('etag');
//project static resource
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.set('Access-Control-Expose-Headers', 'X-Total-Count');
    next();
});
//跨域
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS,PATCH");
    res.header("X-Powered-By",' 3.2.1')
    if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
    else  next();
});

//分页
app.use(pagination(config.pagination.minLimit, config.pagination.maxLimit));


// if (app.get('env') !== 'development') {
//     app.use('/api', identify);
// } else {
//     app.use('/api', identify);
// }

// api
// Client
app.use('/api', clientRouter);

// Admin
app.use('/api/admin', adminRouter);

app.use('/test', test);

app.use('/', index);

app.use('/wechat/auth', wechatAuth);
app.use('/wechat', wechat);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let error = errors.newError(errors.types.TYPE_API_NOT_FOUND);
    next(error);
});


// record error logs
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.DailyRotateFile({
            filename: './logs/request/error.log',
            handleExceptions: true,
            json: true,
            colorize: true
        }),
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ]
}));

// error handle
const handleError = function (err, req, res, next) {
    res.set({'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'});
    res.status(err.status);
    let message = err.message;
    console.log(err.msg)
    if (err.msg) {
        message = req.t(err.msg);
        console.log(message)
    }
    return res.jsonp({
        message: message
    });
};
//define base errors
app.use(function (err, req, res, next) {
    if ('BaseError' !== err.name) {
        err = errors.wrapError(err);
        return next(err);
    }
    handleError(err, req, res, next);
});

//record exception logs
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.DailyRotateFile({
            filename: './logs/request/exception.log',
            handleExceptions: true,
            json: true,
            colorize: true
        }),
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ]
}));
app.use(handleError);
process.on("uncaughtException", function (error) {
    console.log("uncaughtException ", error);
    throw error;
});

module.exports = app;
