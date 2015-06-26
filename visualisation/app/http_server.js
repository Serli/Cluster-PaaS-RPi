var express = require('express');
var io;

const port = 8080;

function startHttpServer(localIp, gossipManager) {

    var app = express();

    app.set('views', '../../visualisation/views');
    app.set('view engine', 'jade');

    app.get('/', function(req, res) {
        res.render('home', {
            title: 'Welcome',
            ip: localIp
        });
    });

    io = require('socket.io').listen(app.listen(port));
    websocketConfiguration(gossipManager);

    console.log('[http server]', 'Http server launched on', localIp + ':' + port);
}

function websocketConfiguration(gossipManager) {
    io.sockets.on('connection', function (socket) {
        console.log('[websocket server] Client connected !');
        gossipManager.getAllPeersInfos();
    });
}

function updateClusterInfos(k, v) {
    if (io !== undefined) {
        console.log('[websocket server] send data through websocket', JSON.stringify(v));
        io.sockets.emit(k, v);
    }
}

module.exports.startHttpServer = startHttpServer;
module.exports.updateClusterInfos = updateClusterInfos;
