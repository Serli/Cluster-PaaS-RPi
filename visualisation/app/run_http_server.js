var http = require('http');
var fs = require('fs');

const port = 8080;

function start_http_server() {
// Chargement du fichier index.html affiché au client
    var server = http.createServer(function (req, res) {
        fs.readFile('../../visualisation/views/index.html', 'utf-8', function (error, content) {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(content);
        });
    });

// Chargement de socket.io
    var io = require('socket.io').listen(server);

// Quand on client se connecte, on le note dans la console
    io.sockets.on('connection', function (socket) {
        console.log('One client connected');
    });

    server.listen(port);
}

module.exports.start_http_server = start_http_server;