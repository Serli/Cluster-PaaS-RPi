var conf = require('../../conf/config');

var logger = require('winston');
logger.level = conf.logLevel;

var express = require('express');
var io;

const PORT = conf.httpPort;

/**
 * Starts the HTTP server in the local IP address.
 * Sets Jade as view engine.
 * Adds the view (../views/home.jade) to main root.
 * Starts the websocket.
 *
 * @param {string} localIp
 * @param {Object} gossipManager
 */
function startHttpServer(localIp, gossipManager) {

    var app = express();

    app.set('views', 'visualisation/views');
    app.set('view engine', 'jade');

    app.get('/', function(req, res) {
        res.render('home', {
            title: 'Cluster informations',
            ip: localIp
        });
    });

    app = require('./api').setupApi(app, gossipManager);

    io = require('socket.io').listen(app.listen(PORT));
    websocketConfiguration(gossipManager);

    logger.info('[http server] Http server launched on %s : %s', localIp, PORT);
}

/**
 * Configures the 'connection' listener to retrieve all peers informations at the client's connection.
 * @param {Object} gossipManager
 */
function websocketConfiguration(gossipManager) {
    io.sockets.on('connection', function (socket) {
        logger.info('[http server] Client connected !');
        gossipManager.getAllPeersInfos();
    });
}

/**
 * Mainly called from the gossip manager. Sends a key/value couple throught the websocket.
 * @param {string} k
 * @param v
 */
function updateClusterInfos(k, v) {
    if (io !== undefined) {
        logger.debug('[http server] send data through websocket - key : %s - value :', k, v);
        io.sockets.emit(k, v);
    }
}

module.exports.startHttpServer = startHttpServer;
module.exports.updateClusterInfos = updateClusterInfos;
