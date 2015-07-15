function setupApi(app, gossipManager) {

    var metaDataManager = require('../../meta-data/meta-data_manager');

    function generateServiceUpdateCallback(add) {
        return function(req, res) {

            var callback = function (err) {
                if (err) {
                    res.json({err: err});
                }
                else {
                    res.json({service: req.params.service});
                }
            };

            metaDataManager.updateServices(
                {
                    service: req.params.service,
                    on: add
                },
                callback
            );
        }
    }

    // adds a service entry in the meta-data of the specified node
    app.put('/meta-data/add-service/:service', generateServiceUpdateCallback(true));

    app.put('/meta-data/remove-service/:service', generateServiceUpdateCallback(false));

    app.get('/nodes/alive', function(req, res) {
        res.json( { alivePeers: gossipManager.livePeers() } );
    });

    app.get('/nodes/lessWorking', function(req, res) {
        gossipManager.getAllPeersMonitoring(function(peersMonitoring) {
            res.json(peersMonitoring);
        })
    });

    app.get('/nodes/workingService/:service', function(req, res) {

    });

    app.get('/monitoring/all', function(req, res) {
        require('../../monitoring/node_monitor').getMonitoringInfos(function(obj) {
            res.json(obj);
        })
    });

    return app;
}

module.exports.setupApi = setupApi;

