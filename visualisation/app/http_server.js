var http = require('http');
var fs = require('fs');

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
    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {
        console.log('Client connected !');
    });
}

module.exports.start_http_server = start_http_server;
