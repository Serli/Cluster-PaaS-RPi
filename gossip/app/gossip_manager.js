var gossiper;

function start(node_infos, callback) {
    var Gossiper = require('../lib/node-gossip').Gossiper;
    gossiper = new Gossiper(node_infos.port, [[node_infos.ip, node_infos.port].join(':')]);

    gossiper.setLocalState('infos', {
        ip : node_infos.ip,
        port : node_infos.port,
        name : node_infos.name
    });

    gossiper.start();

    var view = callback();

    gossiper.on('new_peer', function(peer_ip) {
        function sendInfos() {
            var infos = gossiper.peerValue(peer_ip, 'infos');

            if (port === undefined || name === undefined) {
                setTimeout(function() {
                    sendInfos();
                }, 2000);
            }
            else {
                view.update_cluster_infos('new_peer', infos);
            }
        }

        sendInfos();
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

function get_all_peers_infos() {
    return gossiper.allPeers().map(function(peer_ip) {
        console.log(peer_ip);
        return gossiper.peerValue(peer_ip, 'infos');
    });
}

module.exports.start = start;
module.exports.get_all_peers_infos = get_all_peers_infos;
