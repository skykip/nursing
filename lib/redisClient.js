"use strict";
const config = require('../config/config')["redis"];
const redis = require('redis');
const host = config.host;
const port = config.port;
const client = redis.createClient(port, host);
if (config.index) {
    client.select(config.index, function (err) {});
}
client.on("error", function (err) {
});
client.on("connect", function () {

});

exports.redis = redis;
exports.client = client;