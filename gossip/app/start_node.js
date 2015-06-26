#!/usr/bin/env node
var advertisement = require('../core/advertisement');
var view = require('../../visualisation');
var gossipManager = require('./gossip_manager');

var ip = require("ip");
const nodeIp = ip.address();

var nodeLaunched = false;

const nodeName = require('../core/name_picker').getNodeName();
console.log('>>> node name is :', nodeName);

advertisement.start(nodeName);
searchNodeAndConnect();

function searchNodeAndConnect() {
    advertisement.searchOneNode(function (service) {
        if ( service.addresses.indexOf( nodeIp ) < 0 && !nodeLaunched) {
            console.log('Node found :');
            console.log('   IP :', service.addresses);
            console.log('   Host :', service.host);
            console.log('   Name :', service.txtRecord.cluster_name);

            console.log('Stop looking for nodes');
            advertisement.stopSearching();

            startNode(service.addresses[0]);
        }
    });
}

function startNode(peer_ip) {
    const nodePort = 9000;
    var peerAddr = [peer_ip, nodePort].join(':');

    console.log('Connecting to node', peerAddr);

    const localNodeInfos = {
        ip : nodeIp,
        port : nodePort,
        name : nodeName
    };

    gossipManager.start(localNodeInfos, peerAddr, function() {
        nodeLaunched = true;
        console.log('Node', localNodeInfos.ip, '(' + nodeName + ')', 'started');

        view.startHttpServer(localNodeInfos.ip, gossipManager);
        return view;
    });
}