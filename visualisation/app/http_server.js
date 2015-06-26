var express = require('express');
var io;

const port = 8080;

function start_http_server(local_ip, gossip_manager) {

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
    websocket_configuration(gossip_manager);

    console.log('>>>', 'Http server launched on', local_ip + ':' + port);
}

function websocket_configuration(gossip_manager) {
    io.sockets.on('connection', function (socket) {
        console.log('[websocket] Client connected !');
        var peers_infos = gossip_manager.get_all_peers_infos();

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
