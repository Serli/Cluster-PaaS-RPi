var logger = require('winston');
logger.level = require('../../conf/config').logLevel;

var gossiper;
var view;

var localInfos;
var ipToName = {};

function start(localNodeInfos, peerAddr, confirmGossipStartup) {
    var Gossiper = require('../lib/node-gossip').Gossiper;
    gossiper = new Gossiper(peerAddr.split(':')[1], [peerAddr]);

    gossiper.start();

    localInfos = localNodeInfos;
    gossiper.setLocalState('infos', localNodeInfos);

    confirmGossipStartup();
    view.updateClusterInfos('alone', false);
    getAllPeersInfos();

    gossiper.on('new_peer', function(peerIp) {
        sendPeerInfos('new_peer', peerIp);
    });

    gossiper.on('peer_alive', function(peerObj) {
        view.updateClusterInfos('peer_alive',
            {
                name : ipToName[peerObj.ip],
                threshold : peerObj.threshold,
                phi : peerObj.phi
            }
        );
    });

    gossiper.on('peer_failed', function(peerObj) {
        view.updateClusterInfos('peer_failed',
            {
                name : ipToName[peerObj.ip],
                threshold : peerObj.threshold,
                phi : peerObj.phi
            }
        );
    });

    gossiper.on('update', function(peerIp, key, value) {
        if (key === 'monitoring') {
            value.name = ipToName[peerIp];
            view.updateClusterInfos('monitoring_' + value.name, value);
        }
    });
}

function getPeerInfos(key, peerIp) {
    var infos = gossiper.peerValue(peerIp, 'infos');
    logger.debug('[gossip manager] get infos of %s :', peerIp, infos);

    if (infos) {
        return infos;
    }
    else {
        setTimeout(function() {
            sendPeerInfos(key, peerIp);
        }, 2000);
    }
}

function sendPeerInfos(key, peerIp) {
    var peerInfos = getPeerInfos(key, peerIp);

    if (peerInfos) {
        ipToName[peerIp] = peerInfos.name;
        view.updateClusterInfos(key, peerInfos);
    }
}

function getAllPeersInfos() {
    if (gossiper) {
        gossiper.allPeers().forEach(function(peerIp) {
            sendPeerInfos('update', peerIp);
        });
    }
    else {
        view.updateClusterInfos('alone', true);
    }
}

function setView(v) {
    view = v;
}

function updateMemInfos(memInfos) {
    memInfos.name = localInfos.name;
    gossiper.setLocalState('monitoring', memInfos);
    view.updateClusterInfos('monitoring_' + memInfos.name, memInfos);
}

module.exports.start = start;
module.exports.getAllPeersInfos = getAllPeersInfos;
module.exports.setView = setView;
module.exports.updateMonitoringInfos = updateMemInfos;
