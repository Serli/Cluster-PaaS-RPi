var express = require('express');
var io;

const port = 8080;

function start_http_server(local_ip, gossip) {

    var app = express();

    app.set('views', '../../visualisation/views');
    app.set('view engine', 'jade');

    app.get('/', function(req, res) {
        res.render('home', {
            title: 'Welcome',
            ip: local_ip
        });
    });

    io = require('socket.io').listen(app.listen(port));
    websocket_configuration(gossip);

    console.log('>>>', 'Http server launched on', local_ip, ':', port);
}

function websocket_configuration(gossip) {
    io.sockets.on('connection', function (socket) {
        console.log('[websocket] Client connected !');
        var peers_infos = gossip.allPeers().map(function(peer_ip) {
            return {
                port : gossip.peerValue(peer_ip, 'port'),
                name : gossip.peerValue(peer_ip, 'name'),
                ip : peer_ip
            };
        });

        socket.emit('all_peers_infos', peers_infos);
        console.log("[websocket] All peers infos sent :", JSON.stringify(peers_infos));
    });
}

function update_cluster_infos(k, v) {
    if (io !== undefined) {
        io.sockets.emit(k, v);
    }
}

module.exports.start_http_server = start_http_server;
module.exports.update_cluster_infos = update_cluster_infos;
