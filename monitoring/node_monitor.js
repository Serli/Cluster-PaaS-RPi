var logger = require('winston');
logger.level = require('../conf/config').logLevel;

var os  = require('os-utils');

function startMonitoring(gossipManager) {

    setInterval(function() {
        os.cpuUsage(function(v){
            gossipManager.updateMonitoringInfos(
                {
                    freemem: os.freemem(),
                    totalmem: os.totalmem(),
                    cpus: v
                }
            );
        });
    }, 5000);
}

module.exports.startMonitoring = startMonitoring;
