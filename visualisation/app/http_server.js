var conf = require('../../conf/config');

var logger = require('winston');
logger.level = conf.logLevel;

var metaDataManager = require('../../meta-data/meta-data_manager');

var express = require('express');
var io;

const PORT = conf.httpPort;

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

    // adds a service entry in the meta-data of the specified node
    app.put('/meta-data/add-service/:service', function(req, res) {
        var callback = function(err) {
            if (err) {
                res.json({ err: err });
            }
            else {
                res.json({ service: req.params.service });
            }
        };

        metaDataManager.updateServices(
            {
                service: req.params.service,
                on: true
            },
            callback
        );
    });

    io = require('socket.io').listen(app.listen(PORT));
    websocketConfiguration(gossipManager);

    logger.info('[http server] Http server launched on %s : %s', localIp, PORT);
}

function websocketConfiguration(gossipManager) {
    io.sockets.on('connection', function (socket) {
        logger.info('[http server] Client connected !');
        gossipManager.getAllPeersInfos();
    });
}

function updateClusterInfos(k, v) {
    if (io !== undefined) {
        logger.debug('[http server] send data through websocket - key : %s - value :', k, v);
        io.sockets.emit(k, v);
    }
}

module.exports.startHttpServer = startHttpServer;
module.exports.updateClusterInfos = updateClusterInfos;
