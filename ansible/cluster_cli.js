#!/usr/bin/env node

/**
 * This script allows you to install and remove preconfigured services (from the playbook folder) on n nodes. These nodes will automatically be choosed to be the less busy ones if possible.
 */

var config = require('../conf/config');

var ipToRequest;

const opts = require("nomnom")
    .option('command', {
        choices: ['install', 'remove'],
        required: true,
        position: 0,
        help: 'install | remove'
    })
    .option('nbInstances', {
        required: true,
        position: 1,
        help: 'Number of instance you want to launch',
        tyme: 'integer'
    })
    .option('service', {
        type: 'string',
        required: true,
        position: 2,
        help: 'Name of the service you want to launch, relative to a folder located in "./playbooks"'
    })
    .parse();

/**
 * Runs the get_simple_host_file.sh that returns a list of Raspberry Pi found on the network.
 */
require('child_process').exec('./utils/get_simple_host_file.sh',
    function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + stderr);
        }
        else {
            const ips = stdout.split('\n');
            if ( ips.length > 1 ) {
                if ( ips.length >= opts.nbInstances ) {
                    ipToRequest = ips[0];
                    switch(opts.command) {
                        case 'install':
                            getAllMonitoringInformations(ipToRequest, installServices);
                            break;
                        case 'remove':
                            sendHttpRequest(ipToRequest, '/nodes/workingService/' + opts.service, 'GET', removeServices);
                            break;
                    }
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

/**
 * Builds the Ansible's command and run it on the given nodes. It then updates the meta data on each node.
 * @param {Array} peers
 * @param {string} service
 * @param {boolean} install
 */
function runPlaybookOnNodes(peers, service, install) {
    var Ansible = require('node-ansible');
    var command;
    if (install) {
        command = new Ansible.Playbook().playbook("./playbooks/" + service + "/install_" + service);
    }
    else {
        command = new Ansible.Playbook().playbook("./playbooks/" + service + "/uninstall_" + service);
    }

    var promise = command.user('pi').inventory('./tmp/' + service + '_hosts').askPass().exec();

    promise.then(function() {
        console.log('>>>', 'Done !');
        console.log('Updating meta-data ...');
        updateMetaData(peers, install, function(res) {
            res.on('error', function (err) {
                console.log('error :', err);
            });
        });
    }, function(err) {
        console.error(err);
    })
}

/**
 * Generates a string containing the informations to put in the Ansible's hosts file to be used by the playbook.
 * @param {Array} nodes
 * @param {string} service
 * @returns {string} output
 */
function generateSpecificHostsFile(nodes, service) {
    var output = "[" + service + "]\n";
    nodes.forEach(function(node) {
        output += node + "\n";
    });
    return output;
}

/**
 * Creates the Ansible's hosts file in ./tmp
 * @param {string} content
 * @param {string} service
 * @param {function} hostFileCreationCallback
 */
function createHostFile(content, service, hostFileCreationCallback) {
    var fs = require('fs');
    fs.writeFile(__dirname + "/tmp/" + service + "_hosts", content, hostFileCreationCallback);
}

/**
 * Applies weights to the monitoring values and computes a factor used to sort nodes by busyness. The less the factor is, the less busy is the node.
 * @param {Array} allPeersMonitoringInfos
 * @returns {Array} lessWorkingNodes
 */
function findLessWorkingNodes( allPeersMonitoringInfos ) {
    return allPeersMonitoringInfos.map(function(peerMonitor) {
        const loadavg1 = peerMonitor.loadavg1 / peerMonitor.countCPUs;
        const loadavg5 = peerMonitor.loadavg5 / peerMonitor.countCPUs;
        const loadavg15 = peerMonitor.loadavg15 / peerMonitor.countCPUs;

        const freememRatio = (peerMonitor.totalmem - peerMonitor.freemem) / peerMonitor.totalmem;

        return {
            ip: peerMonitor.ip,
            rate: ((loadavg15 * 3) + (loadavg5 * 2) + (loadavg1) + (freememRatio * 4)) / 4
        };
    });
}

/**
 * The main function called when the remove argument is passed to the script. It finds the nodes where the service is not install yet, generates the hosts file dynamically and runs the playbook.
 * @param {Object} httpResponse
 */
function removeServices(httpResponse) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    httpResponse.on('data', function (chunk) {
        str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    httpResponse.on('end', function () {
        const result = JSON.parse(str);
        if (result.res) {
            const slicedNodeList = result.res.slice(0, opts.nbInstances);

            var hostFileCreationCallback = function (err) {
                if (err) {
                    console.log(err);
                }

                console.log("\n\nTemp host file saved !");
                runPlaybookOnNodes(slicedNodeList, opts.service, false);
            };

            createHostFile( generateSpecificHostsFile(slicedNodeList, opts.service), opts.service, hostFileCreationCallback );
        }
        else {
            console.log('Error :', result.error);
        }
    });
}

/**
 * The main function called when the install argument is passed to the script.
 * It finds all the available nodes, removes the ones where the service is installed, sort them by busyness, generates the hosts file and runs the playbook.
 * @param {Object} httpResponse
 */
function installServices(httpResponse) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    httpResponse.on('data', function (chunk) {
        str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    httpResponse.on('end', function () {
        const result = JSON.parse(str);
        if (result.res) {
            const peersHealtRates = findLessWorkingNodes( result.res, opts.nbInstances );
            function callback(peersNotRunningTheService) {
                if (peersNotRunningTheService.length >= opts.nbInstances) {
                    const sortedNodeList = peersNotRunningTheService.sort(function(a, b) { return a.rate - b.rate; })
                    const slicedNodeList = sortedNodeList.slice(0, opts.nbInstances);
                    const simplifiedNodeList = slicedNodeList.map(function (node) { return node.ip; });

                    var hostFileCreationCallback = function (err) {
                        if (err) {
                            console.log(err);
                        }

                        console.log("\n\nTemp host file saved !");

                        runPlaybookOnNodes(simplifiedNodeList, opts.service, true);
                    };
                    createHostFile( generateSpecificHostsFile(simplifiedNodeList, opts.service), opts.service, hostFileCreationCallback );
                }
                else {
                    console.log('Error : you asked for', opts.nbInstances, 'instances but only', peersNotRunningTheService.length, 'is/are available.');
                }
            }

            removePeersRunningTheService( peersHealtRates, callback );
        }
        else {
            console.log('Error :', result.error);
        }
    });
}

/**
 * Removes the peers where the service passed in arguments to the script is installed.
 * @param {Array} availablePeers
 * @param {function} callback
 */
function removePeersRunningTheService( availablePeers, callback ) {
    sendHttpRequest(ipToRequest, '/nodes/workingService/' + opts.service, 'GET', function(response) {
        var str = "";

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            const result = JSON.parse(str);
            if (result.res) {
                var reducedList = [];
                availablePeers.forEach(function(availablePeer) {
                    if ( result.res.indexOf( availablePeer.ip ) < 0 ) {
                        reducedList.push(availablePeer);
                    }
                });
                callback(reducedList);
            }
        });
    })
}

/**
 * Updates the meta-data on all the peers given in argument.
 * @param {Array} peers
 * @param {boolean} install
 * @param {function} callback
 */
function updateMetaData(peers, install, callback) {
    var path;
    if (install) {
        path = '/meta-data/add-service/' + opts.service;
    }
    else {
        path = '/meta-data/remove-service/' + opts.service;
    }

    peers.forEach(function(node) {
        sendHttpRequest(node, path, 'PUT', callback);
    });
}

/**
 * Sends a HTTP request to a node (no matter which one) to get the monitoring informations of all the available nodes.
 * @param {string} ip
 * @param {function} callback
 */
function getAllMonitoringInformations(ip, callback) {
    sendHttpRequest(ip, '/nodes/monitoring', 'GET', callback);
}

/**
 * Sends a HTTP request to the given IP address
 * @param {string} ip
 * @param {string} path
 * @param {string} method
 * @param {function} callback
 */
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