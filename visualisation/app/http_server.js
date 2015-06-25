var express = require('express');
var io;

const port = 8080;

function start_http_server(local_ip) {

    var app = express();

    app.set('views', '../../visualisation/views');
    app.set('view engine', 'jade');

    app.get('/', function(req, res) {
        res.render('home', {
            title: 'Welcome',
            ip: local_ip
        });
    });

    //---------------------

    io = require('socket.io').listen(app.listen(port));
    websocket_configuration();

}

function websocket_configuration() {
    io.sockets.on('connection', function (socket) {
        console.log('Client connected !');
    });
}

function update_cluster_infos(k, v) {
    io.emit(k, v);
}

module.exports.start_http_server = start_http_server;
module.exports.update_cluster_infos = update_cluster_infos;
