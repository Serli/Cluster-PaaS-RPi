#!/usr/bin/env node

const opts = require("nomnom")
        .option('command', {
            choices: ['add-service', 'remove-service'],
            required: true,
            position: 0,
            help: 'add-service | remove-service'
        })
        .option('ip', {
            type: 'string',
            required: true,
            position: 1,
            help: 'The ip of the node you want to reach to change meta-data'
        })
        .option('service', {
            type: 'string',
            required: true,
            position: 2,
            help: 'The service you want to change'
        })
    .parse();

setMetaData(opts.ip, opts.service, opts.command);

/**
 * Sends a HTTP request to a node to update its meta-data using the REST API.
 * @param {string} ip
 * @param {string} service
 * @param {string} action
 */
function setMetaData(ip, service, action) {
    var http = require('http');
    var config = require('../conf/config');

    var options = {
        host: ip,
        port: config.httpPort,
        path: '/meta-data/' + action + '/' + service,
        method: 'PUT'
    };

    var req = http.request(options, function(res) {
        console.log('>>> Response :', res.statusCode);
    });

    // write the request parameters
    req.write('post=data&is=specified&like=this');
    req.end();

    console.log('Request sent ...');
}