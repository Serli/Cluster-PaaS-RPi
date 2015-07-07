var logger = require('winston');
logger.level = require('../conf/config').logLevel;

require('./lib/node-monitor/monitor');

function startMonitoring(gossipManager) {
    var processMonitor = new Monitor({probeClass:'Process'});
    processMonitor.connect();

    processMonitor.on('change', function() {
        gossipManager.updateMemInfos(
            {
                freemem: processMonitor.get('freemem'),
                totalmem: processMonitor.get('totalmem')
            }
        );
    });
}

module.exports.startMonitoring = startMonitoring;
