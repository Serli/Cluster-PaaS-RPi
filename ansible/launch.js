#!/usr/bin/env node

var config = require('../conf/config');

const opts = require("nomnom")
    .option('nbInstances', {
        required: true,
        position: 0,
        help: 'Number of instance you want to launch',
        tyme: 'integer'
    })
    .option('service', {
        type: 'string',
        required: true,
        position: 1,
        help: 'Name of the service you want to launch, relative to a folder located in "./playbooks"'
    })
    .parse();

require('child_process').exec('./utils/get_simple_host_file.sh',
    function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + stderr);
        }
        else {
            const ips = stdout.split('\n');
            if ( ips.length > 1 ) {
                getLessWorkingNode(ips[0], treatResponse);
            }
            else {
                console.log("No Raspberry Pi found on through the network ...");
            }
        }
    }
);

function findLessWorkingNode( allPeersMonitoringInfos, nbNodesToTake ) {
    const peersHealtRates = allPeersMonitoringInfos.map(function(peerMonitor) {
        const loadavg1 = peerMonitor.loadavg1 / peerMonitor.countCPUs;
        const loadavg5 = peerMonitor.loadavg5 / peerMonitor.countCPUs;
        const loadavg15 = peerMonitor.loadavg15 / peerMonitor.countCPUs;

        const freememRatio = (peerMonitor.totalmem - peerMonitor.freemem) / peerMonitor.totalmem;

        return {
            ip: peerMonitor.ip,
            rate: ((loadavg15 * 3) + (loadavg5 * 2) + (loadavg1) + (freememRatio * 4)) / 4
        };
    });

    const sortedPeersHealtRates = peersHealtRates.sort(function(a, b) { return a.rate - b.rate; });

    console.log(sortedPeersHealtRates.slice(0, nbNodesToTake));
}

function treatResponse(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
        str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
        const result = JSON.parse(str);
        if (result.res) {
            findLessWorkingNode( result.res, opts.nbInstances );
        }
        else {
            console.log('Error :', result.error);
        }
    });
}

function getLessWorkingNode(ipppp, callback) {
    var http = require('http');

    const ip = '192.168.86.194';
    var options = {
        host: ip,
        port: config.httpPort,
        path: '/nodes/lessWorking',
        method: 'GET'
    };

    var req = http.request(options, callback);

    // write the request parameters
    req.write('post=data&is=specified&like=this');
    req.end();
}