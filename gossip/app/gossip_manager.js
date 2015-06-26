var gossiper;
var view;

function start(localNodeInfos, peerAddr, callback) {
    var Gossiper = require('../lib/node-gossip').Gossiper;
    gossiper = new Gossiper(peerAddr.split(':')[1], [peerAddr]);

    gossiper.start();

    gossiper.setLocalState('infos', {
        ip : localNodeInfos.ip,
        port : localNodeInfos.port,
        name : localNodeInfos.name
    });

    view = callback();

    gossiper.on('new_peer', function(peerIp) {
        sendPeerInfos('new_peer', peerIp);
    });

    gossiper.on('peer_alive', function(peerIp) {
        view.updateClusterInfos('peer_alive', peerIp);
    });

    gossiper.on('peer_failed', function(peerIp) {
        view.updateClusterInfos('peer_failed', peerIp);
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
        view.updateClusterInfos(key, peerInfos);
    }
}

function getAllPeersInfos() {
    return gossiper.allPeers().forEach(function(peerIp) {
        sendPeerInfos('update', peerIp);
    });
}

module.exports.start = start;
module.exports.getAllPeersInfos = getAllPeersInfos;
