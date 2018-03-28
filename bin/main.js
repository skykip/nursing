var cluster = require('cluster');
var models = require("../models");

var WORKER_SERVER_NAME = "server";
//var WORKER_TASK_NAME = "task";

if (cluster.isMaster) {
    console.log(cluster.isMaster);
    models.sequelize.sync(/* {force: true} */ ).then(function () {
        var setup = require('../setup/setup');
        if (setup.init()) {
            var serverWorker = cluster.fork({ROLE: WORKER_SERVER_NAME});
           // var taskWorker = cluster.fork({ROLE: WORKER_TASK_NAME});
        } else {
            throw new Error("Setup failed");
        }
        return null;
    }).catch(function (err) {
        console.error(err);
    });
    
       // var server = require('./server');
        
    
    return;
} else if (cluster.isWorker) {
    // if (process.env.ROLE === WORKER_TASK_NAME) {
    //     var task = require('./task');
    //     task.run();
    //     return;
    console.log("=========")
     if (process.env.ROLE === WORKER_SERVER_NAME) {
        var server = require('./server');
        
    }
}
