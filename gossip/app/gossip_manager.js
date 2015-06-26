var gossiper;
var view;

function start(local_node_infos, peer_addr, callback) {
    var Gossiper = require('../lib/node-gossip').Gossiper;
    gossiper = new Gossiper(peer_addr.split(':')[1], [peer_addr]);

    gossiper.start();

    gossiper.setLocalState('infos', {
        ip : local_node_infos.ip,
        port : local_node_infos.port,
        name : local_node_infos.name
    });

    view = callback();

    gossiper.on('new_peer', function(peer_ip) {
        view.update_cluster_infos('new_peer', getPeerInfos(peer_ip));
    });

    gossiper.on('peer_alive', function(peer_ip) {
        view.update_cluster_infos('peer_alive', peer_ip);
    });

    gossiper.on('peer_failed', function(peer_ip) {
        view.update_cluster_infos('peer_failed', peer_ip);
    });

    gossiper.on('update', function(peer_ip, key, value) {
        //console.log("peer " + peer_ip + " set " + key + " to " + value);
    });
}

function getPeerInfos(peer_ip) {
    var infos = gossiper.peerValue(peer_ip, 'infos');
    console.log('[gossip manager] get infos for', peer_ip, ':', infos);

    if (infos) {
        return infos;
    }
    else {
        setTimeout(function() {
            sendPeerInfos(peer_ip);
        }, 2000);
    }
}

function sendPeerInfos(peer_ip) {
    var peerInfos = getPeerInfos(peer_ip);

    if (peerInfos) {
        view.update_cluster_infos('update', peerInfos);
    }
}

function get_all_peers_infos() {
    return gossiper.allPeers().forEach(function(peer_ip) {
        sendPeerInfos(peer_ip);
    });
}

module.exports.start = start;
module.exports.get_all_peers_infos = get_all_peers_infos;
