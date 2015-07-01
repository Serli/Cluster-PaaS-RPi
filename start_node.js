#!/usr/bin/env node
var advertisement = require('./gossip/core/advertisement');
var view = require('./visualisation/index');
var gossipManager = require('./gossip/app/gossip_manager');

var winston = require('winston');
winston.level = require('./conf/config').logLevel;

var ip = require("ip");
const nodeIp = ip.address();

var nodeLaunched = false;

const nodeName = require('./gossip/core/name_picker').getNodeName();
winston.info('>>> node name is :', nodeName);

advertisement.start(nodeName);
searchNodeAndConnect();

view.startHttpServer(nodeIp, gossipManager);
gossipManager.setView(view);

function searchNodeAndConnect() {
    advertisement.searchOneNode(function (service) {
        if ( service.addresses.indexOf( nodeIp ) < 0 && !nodeLaunched) {
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
    const nodePort = 9000;
    var peerAddr = [peer_ip, nodePort].join(':');

    winston.info('Connecting to node', peerAddr);

    const localNodeInfos = {
        ip : nodeIp,
        port : nodePort,
        name : nodeName
    };

    gossipManager.start(localNodeInfos, peerAddr, function() {
        nodeLaunched = true;
        winston.info('Node', localNodeInfos.ip, '(' + nodeName + ')', 'started');
    });
}