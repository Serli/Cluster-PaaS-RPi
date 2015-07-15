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
                if ( ips.length >= opts.nbInstances ) {
                    getLessWorkingNodes(ips[0], treatResponse);
                }
                else {
                    console.log(ips.length + " found on the network. You asked for " + opts.nbInstances + " instances.");
                }
            }
            else {
                console.log("No Raspberry Pi found on through the network ...");
            }
        }
    }
);

function runPlaybookOnNodes(sortedPeersHealtRates, service) {
    var Ansible = require('node-ansible');
    var command = new Ansible.Playbook().playbook("./playbooks/" + service + "/install_" + service);
    var promise = command.user('pi').inventory('./tmp/' + service + '_hosts').askPass().exec();

    promise.then(function() {
        console.log('>>>', 'Done !');
        console.log('Updating meta-data ...');
        updateMetaData(sortedPeersHealtRates, function(res) {
            res.on('error', function (err) {
                console.log('error :', err);
            });
        });
    }, function(err) {
        console.error(err);
    })
}

function generateSpecificHostsFile(nodes, service) {
    var output = "[" + service + "]\n";
    nodes.forEach(function(node) {
        output += node.ip + "\n";
    });
    return output;
}

function createHostFile(outputFile, service, hostFileCreationCallback) {
    var fs = require('fs');
    fs.writeFile(__dirname + "/tmp/" + service + "_hosts", outputFile, hostFileCreationCallback);
}

function findLessWorkingNode( allPeersMonitoringInfos ) {
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

    return peersHealtRates.sort(function(a, b) { return a.rate - b.rate; });
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
            const sortedPeersHealtRates = findLessWorkingNode( result.res, opts.nbInstances );
            const slicedNodeList = sortedPeersHealtRates.slice(0, opts.nbInstances);

            var hostFileCreationCallback = function (err) {
                if (err) {
                    console.log(err);
                }

                console.log("\n\nFile saved !");

                runPlaybookOnNodes(slicedNodeList, opts.service);
            };
            createHostFile( generateSpecificHostsFile(slicedNodeList, opts.service), opts.service, hostFileCreationCallback );
        }
        else {
            console.log('Error :', result.error);
        }
    });
}

function updateMetaData(sortedPeersHealtRates, callback) {
    sortedPeersHealtRates.forEach(function(node) {
        sendHttpRequest(node.ip, '/meta-data/add-service/' + opts.service, 'PUT', callback);
    });
}

function getLessWorkingNodes(ip, callback) {
    sendHttpRequest(ip, '/nodes/lessWorking', 'GET', callback);
}

function sendHttpRequest(ip, path, method, callback) {
    var http = require('http');

    var options = {
        host: ip,
        port: config.httpPort,
        path: path,
        method: method
    };

    var req = http.request(options, callback);

    // write the request parameters
    req.write('post=data&is=specified&like=this');
    req.end();
}