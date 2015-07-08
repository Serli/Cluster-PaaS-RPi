var logger = require('winston');
logger.level = require('../conf/config').logLevel;

var os  = require('os-utils');

function startMonitoring(gossipManager) {

    setInterval(function() {
        os.cpuUsage(function(v){
            gossipManager.updateMonitoringInfos(
                {
                    countCPUs: os.cpuCount(),
                    freemem: os.freemem(),
                    totalmem: os.totalmem(),
                    cpus: v,
                    loadavg1: os.loadavg(1),
                    loadavg5: os.loadavg(5),
                    loadavg15: os.loadavg(15)
                }
            );
        });
    }, 5000);
}

module.exports.startMonitoring = startMonitoring;
