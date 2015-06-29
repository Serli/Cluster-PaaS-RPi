var gossiper;
var view;

var ipToName = {};

function start(localNodeInfos, peerAddr, confirmGossipStartup) {
    var Gossiper = require('../lib/node-gossip').Gossiper;
    gossiper = new Gossiper(peerAddr.split(':')[1], [peerAddr]);

    gossiper.start();

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
        //console.log("peer " + peerIp + " set " + key + " to " + value);
    });
}

function getPeerInfos(key, peerIp) {
    var infos = gossiper.peerValue(peerIp, 'infos');
    console.log('[gossip manager] get infos for', peerIp, ':', infos);

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

module.exports.start = start;
module.exports.getAllPeersInfos = getAllPeersInfos;
module.exports.setView = setView;
