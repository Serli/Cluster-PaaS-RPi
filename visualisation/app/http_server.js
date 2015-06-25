var http = require('http');
var fs = require('fs');
var io;

const port = 8080;

function start_http_server() {

    var server = http.createServer(function (req, res) {
        fs.readFile('../../visualisation/views/index.html', 'utf-8', function (error, content) {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(content);
        });
    });

    websocket_configuration(server);
    server.listen(port);
}

function websocket_configuration(server) {
    io = require('socket.io').listen(server);
    io.sockets.on('connection', function (socket) {
        console.log('Client connected !');
    });
}

function update_cluster_infos(k, v) {
    io.emit(k, v);
}

module.exports.start_http_server = start_http_server;
module.exports.update_cluster_infos = update_cluster_infos;
