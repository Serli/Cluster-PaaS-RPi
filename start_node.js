#!/usr/bin/env node
var advertisement = require('./gossip/core/advertisement');
var view = require('./visualisation/index');
var gossipManager = require('./gossip/app/gossip_manager');
var nodeMonitor = require('./monitoring/node_monitor');

var winston = require('winston');
winston.level = require('./conf/config').logLevel;

var ip = require("ip");
const NODE_IP = ip.address();

var nodeLaunched = false;

const NODE_NAME = require('./gossip/core/name_picker').getNodeName();
winston.info('>>> node name is :', NODE_NAME);

advertisement.start(NODE_NAME);
searchNodeAndConnect();

view.startHttpServer(NODE_IP, gossipManager);
gossipManager.setView(view);

function searchNodeAndConnect() {
    advertisement.searchOneNode(function (service) {
        if ( service.addresses.indexOf( NODE_IP ) < 0 && !nodeLaunched) {
            winston.info('Node found :');
            winston.info('   IP :', service.addresses);
            winston.info('   Host :', service.host);

            winston.info('Stop looking for nodes');
            advertisement.stopSearching();

            startNode(service.addresses[0]);
        }
    });
}

function startNode(peer_ip) {
    const NODE_PORT = 9000;
    var peerAddr = [peer_ip, NODE_PORT].join(':');

    winston.info('Connecting to node', peerAddr);

    const localNodeInfos = {
        ip : NODE_IP,
        port : NODE_PORT,
        name : NODE_NAME
    };

    gossipManager.start(localNodeInfos, peerAddr, function() {
        nodeMonitor.startMonitoring(gossipManager);
        nodeLaunched = true;
        winston.info('Node', localNodeInfos.ip, '(' + NODE_NAME + ')', 'started');
    });
}