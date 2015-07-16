/**
 * Adds the REST API to the HTTP server
 * @param {Object} app
 * @param {Object} gossipManager
 * @returns {Object} app
 */
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

    /**
     * Add a service to the meta-data of the node (`~/meta-data.json`). Mainly used to avoid running a playbook several times on the same node.
     */
    app.put('/meta-data/add-service/:service', generateServiceUpdateCallback(true));

    /**
     * Remove a service to the meta-data of the node (`~/meta-data.json`). Mainly used to avoid running a playbook several times on the same node.
     */
    app.put('/meta-data/remove-service/:service', generateServiceUpdateCallback(false));

    /**
     * Returns an array containing the IP adresses of alive nodes.
     */
    app.get('/nodes/alive', function(req, res) {
        res.json( { alivePeers: gossipManager.livePeers() } );
    });

    /**
     * Returns all the monitoring informations about all the nodes.
     */
    app.get('/nodes/monitoring', function(req, res) {
        gossipManager.getAllPeersMonitoring(function(peersMonitoring) {
            res.json(peersMonitoring);
        })
    });

    /**
     * Returns an array of objects containing the services installed on each node.
     */
    app.get('/nodes/workingService/:service', function(req, res) {
        gossipManager.getAllNodesInstalledService(req.params.service, function(peersMetaData) {
            res.json(peersMetaData);
        })
    });

    return app;
}

module.exports.setupApi = setupApi;

