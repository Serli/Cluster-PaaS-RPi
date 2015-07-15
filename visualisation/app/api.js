function setupApi(app, gossipManager) {

    var metaDataManager = require('../../meta-data/meta-data_manager');

    function generateServiceUpdateCallback(add) {
        return function(req, res) {

            var callback = function (currentMetaDataObj, err) {
                if (err) {
                    res.json({err: err});
                }
                else {
                    gossipManager.updateMetaData(currentMetaDataObj);
                    res.json({service: req.params.service});
                }
            };

            const metaData = metaDataManager.updateServices(
                {
                    service: req.params.service,
                    on: add
                },
                callback
            );

            gossipManager.updateMetaData(metaData);
        }
    }

    // adds a service entry in the meta-data of the specified node
    app.put('/meta-data/add-service/:service', generateServiceUpdateCallback(true));

    app.put('/meta-data/remove-service/:service', generateServiceUpdateCallback(false));

    app.get('/nodes/alive', function(req, res) {
        res.json( { alivePeers: gossipManager.livePeers() } );
    });

    app.get('/nodes/monitoring', function(req, res) {
        gossipManager.getAllPeersMonitoring(function(peersMonitoring) {
            res.json(peersMonitoring);
        })
    });

    app.get('/nodes/workingService/:service', function(req, res) {
        gossipManager.getAllNodesRunningService(req.params.service, function(peersMetaData) {
            res.json(peersMetaData);
        })
    });

    return app;
}

module.exports.setupApi = setupApi;

