var Gossiper = require('../lib/node-gossip').Gossiper;

function start(node_ip, node_port, node_name, callback) {
    var g = new Gossiper(node_port, [[node_ip, node_port].join(':')]);

    g.setLocalState('ip', node_ip);
    g.setLocalState('port', node_port);
    g.setLocalState('name', node_name);

    g.start();

    var view = callback(g);

    g.on('new_peer', function(peer_ip) {
        function sendInfos() {
            var port = g.peerValue(peer_ip, 'port');
            var name = g.peerValue(peer_ip, 'name');
            var infos = {
                port: port,
                name: name,
                ip: peer_ip
            };

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

    g.on('peer_alive', function(peer_ip) {
        view.update_cluster_infos('peer_alive', peer_ip);
    });

    g.on('peer_failed', function(peer_ip) {
        view.update_cluster_infos('peer_failed', peer_ip);
    });

    g.on('update', function(peer_ip, key, value) {
        //console.log("peer " + peer_ip + " set " + key + " to " + value);
    });
}

module.exports.start = start;