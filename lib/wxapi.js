/**
 * wxapi.js
 * Created by haroldsong on 16/3/31.
 * Copyright (c) 2016 Tencent Inc. All rights reserved.
 * Description:微信公众号的API封装
 */

var fs = require("fs");
var API = require('wechat-api');
var wechatMenu = require('./wechatMenu.js');
var customerConfig = require('../config/config.js')['wechat']['customer'];
var workerConfig = require('../config/config.js')['wechat']['worker'];

var customerTokenFile = customerConfig.cache_json_file + '/access_token.txt';
var workerTokenFile = workerConfig.cache_json_file + '/access_token.txt';

var customerAPI = new API(customerConfig.appId, customerConfig.appSecret, function (callback) {
    // 传入一个获取全局token的方法
    fs.readFile(customerTokenFile, 'utf8', function (err, data) {
        if (err) {return callback(err);}
        callback(null, data && JSON.parse(data));
    });
}, function (token, callback) {
    fs.writeFile(customerTokenFile, JSON.stringify(token), callback);
});

var workerAPI = new API(workerConfig.appId, workerConfig.appSecret, function (callback) {
    // 传入一个获取全局token的方法
    fs.readFile(workerTokenFile, 'utf8', function (err, data) {
        if (err) {return callback(err);}
        callback(null, data && JSON.parse(data));
    });
}, function (token, callback) {
    fs.writeFile(workerTokenFile, JSON.stringify(token), callback);
});

/**
 * 创建菜单前，先删除以前的菜单
 * @param {*微信菜单} wechatMenu 
 */
var createWechatMenu = function(){
    customerAPI.createMenu(wechatMenu,function(err, result) {
        console.log("createMenu err", err);
        console.log("createMenu result:   ", result);
    });
}

/**
 * 获取菜单
 */
var getWechatMenu = function(){
    customerAPI.getMenu(function(err, result) {
        console.log("getMenu err", err);
        console.log("result:   ", result);
    });
}


/**
 * 删除菜单
 */
var removeWechatMenu = function(){
    customerAPI.removeMenu(function(err, result) {
        console.log("removeMenu err", err);
        console.log("result:   ", result);
    });
}


var sendTemplateMsg2Customer = function(toUser, templateId, url, data) {
    console.log("c_openid: ", toUser);
    console.log("c_templateId: ", templateId);
    console.log("c_url: ", url);
    console.log("c_data: ", data);
    customerAPI.sendTemplate(toUser, templateId, url, data, function(err, result) {
        console.log("customer template err", err);
        console.log("result:   ", result);
    });
};

var sendTemplateMsg2Worker = function(toUser, templateId, url, data) {
    console.log("openid: ", toUser);
    console.log("templateId: ", templateId);
    console.log("url: ", url);
    console.log("data: ", data);
    workerAPI.sendTemplate(toUser, templateId, url, data, function(err, result) {
        console.log("worker template err", err);
    });
};

var sendTemplateMsg2Supervisor = function(toUsers, templateId, url, data) {
    for (var index = 0, len = toUsers.length; index < len; ++index) {
        workerAPI.sendTemplate(toUsers[index], templateId, url, data, function(err, result) {
            console.log("supervisor template err", err);
        });
    }
};

var typeValue = {
    "image": ".jpg",
    "voice": ".amr",
    "video": ".mp4"
};

var sendMsg2Customer = function(userOpenId, content, type, cb) {
    if (type === "text") {
        customerAPI.sendText(userOpenId, content, function(err, result) {
            cb(err, content);
        });
    } else {
        workerAPI.getMedia(content, function(err, result) {
            var fileName = ['./data/temp/', content, typeValue[type]].join('');
            fs.writeFile(fileName, result, function(err){
                if(err) throw err;
                customerAPI.uploadMedia(fileName, type, function(err, result) {
                    var media_id = result.media_id;
                    switch (type) {
                        case "image":
                            customerAPI.sendImage(userOpenId, result.media_id, function(err, result) {
                                cb(err, media_id);
                            });
                            break;
                        case "voice":
                            customerAPI.sendVoice(userOpenId, result.media_id, function(err, result) {
                                cb(err, media_id);
                            });
                            break;
                        case "video":
                            customerAPI.sendVideo(userOpenId, result.media_id, function(err, result) {
                                cb(err, media_id);
                            });
                            break;
                    }
                });
            });
        });
    }
};

var sendMsg2Worker = function(userOpenId, content, type, cb) {
    if (type === "text") {
        workerAPI.sendText(userOpenId, content, function(err, result) {
            cb(err, content);
        });
    } else {
        customerAPI.getMedia(content, function(err, result) {
            if(err) return;
            var fileName = ['./data/temp/', content, typeValue[type]].join('');
            fs.writeFile(fileName, result, function(err){
                if(err) return;
                workerAPI.uploadMedia(fileName, type, function(err, result) {
                    if(err) return;
                    fs.unlinkSync(fileName);
                    var media_id = result.media_id;
                    switch (type) {
                        case "image":
                            workerAPI.sendImage(userOpenId, result.media_id, function(err, result) {
                                cb(err, media_id);
                            });
                            break;
                        case "voice":
                            workerAPI.sendVoice(userOpenId, result.media_id, function(err, result) {
                                cb(err, media_id);
                            });
                            break;
                        case "video":
                            workerAPI.sendVideo(userOpenId, result.media_id, function(err, result) {
                                cb(err, media_id);
                            });
                            break;
                    }
                });
            });
        });
    }
};

var moveSupervisor = function (openId) {
    workerAPI.moveUserToGroup(openId, 100, function (err, result) {
    });
};

var moveNormalGroup = function (openId) {
    workerAPI.moveUserToGroup(openId, 0, function (err, result) {
    });
};

exports.getWechatMenu = getWechatMenu;
exports.createWechatMenu = createWechatMenu;
exports.removeWechatMenu = removeWechatMenu;

exports.sendTemplateMsg2Customer = sendTemplateMsg2Customer;
exports.sendTemplateMsg2Worker = sendTemplateMsg2Worker;
exports.sendTemplateMsg2Supervisor = sendTemplateMsg2Supervisor;
exports.sendMsg2Customer = sendMsg2Customer;
exports.sendMsg2Worker = sendMsg2Worker;
exports.moveSupervisor = moveSupervisor;
exports.moveNormal = moveNormalGroup;