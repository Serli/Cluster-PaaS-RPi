/**
 * Manage the gossip between all nodes in the cluster. It uses an implementation of the gossip protocol found here : https://github.com/bpot/node-gossip
 * When started, the gossip manager will broadcast the local states (several key/value) to the cluster in order to keep every node up to date.
 * It also manage the failure detector and uses the gossip protocol to keep everyone aware about the health of the nodes.
 * The gossip manager needs another peer to start up so it cannot be launched if the node is the only one running in the cluster.
 */

var logger = require('winston');
logger.level = require('../../conf/config').logLevel;

var gossiper;
var view;

var localInfos;
var ipToName = {};

/**
 * Starts the node manager by setting all the local states needed at start up, sends informations to the websocket and sets the gossip listeners.
 * @param {Object} localNodeInfos
 * @param {string} peerAddr
 * @param {function} confirmGossipStartup
 */
function start(localNodeInfos, peerAddr, confirmGossipStartup) {
    var Gossiper = require('../lib/node-gossip').Gossiper;
    gossiper = new Gossiper(peerAddr.split(':')[1], [peerAddr]);

    gossiper.start();

    localInfos = localNodeInfos;
    gossiper.setLocalState('infos', localNodeInfos);

    const metaData = require('../../meta-data/meta-data_manager').getMetaData();
    gossiper.setLocalState('meta-data', metaData);

    confirmGossipStartup();
    view.updateClusterInfos('alone', false);
    getAllPeersInfos();

    gossiper.on('new_peer', function(peerIp) {
        sendPeerInfos('new_peer', peerIp);
    });

    gossiper.on('peer_alive', function(peerObj) {
        view.updateClusterInfos('peer_alive',
            {
                name : ipToName[peerObj.ip],
                threshold : peerObj.threshold,
                phi : peerObj.phi
            }
        );
    });

    gossiper.on('peer_failed', function(peerObj) {
        view.updateClusterInfos('peer_failed',
            {
                name : ipToName[peerObj.ip],
                threshold : peerObj.threshold,
                phi : peerObj.phi
            }
        );
    });

    gossiper.on('update', function(peerIp, key, value) {
        if (key === 'monitoring') {
            value.name = ipToName[peerIp];
            view.updateClusterInfos('monitoring_' + value.name, value);
        }
    });
}

/**
 * Gets the value of the given key from the given node using gossip.
 * @param {string} key
 * @param {string} peerIp
 */
function getPeerInfos(key, peerIp) {
    var infos = gossiper.peerValue(peerIp, 'infos');
    logger.debug('[gossip manager] get infos of %s :', peerIp, infos);

    if (infos) {
        return infos;
    }
    else {
        setTimeout(function() {
            sendPeerInfos(key, peerIp);
        }, 2000);
    }
}

/**
 * Sends the value of the given key from the given node to the websocket.
 * @param {string} key
 * @param {string} peerIp
 */
function sendPeerInfos(key, peerIp) {
    var peerInfos = getPeerInfos(key, peerIp);

    if (peerInfos) {
        ipToName[peerIp] = peerInfos.name;
        view.updateClusterInfos(key, peerInfos);
    }
}

/**
 * Sends the main informations about all peers one by one to the websocket. Used to initiate and refresh the cluster's informations webpage.
 */
function getAllPeersInfos() {
    if (gossiper) {
        gossiper.livePeers().forEach(function(peerIp) {
            sendPeerInfos('update', peerIp);
        });
    }
    else {
        view.updateClusterInfos('alone', true);
    }
}

/**
 * Gets the value of the given key from all alive peers and puts them into the callback.
 * @param {string} key
 * @param {function} callback
 */
function getAllPeersValue(key, callback) {
    if (gossiper) {
        var res = [];
        const allPeers = gossiper.livePeers();

        allPeers.forEach(function(peerIp) {
            var value = gossiper.peerValue(peerIp, key);
            value.ip = peerIp.split(':')[0];
            res.push(value);
            if (res.length === allPeers.length) {
                callback({ res: res });
            }
        });
    }
    else {
        callback({ error: 'No gossiper started. The node il probably alone in the cluster.'});
    }
}

/**
 * Gets the monitoring informations from all alive peers and puts them into the callback.
 * @param {function} callback
 */
function getAllPeersMonitoring(callback) {
    getAllPeersValue('monitoring', callback)
}

/**
 * Gets a list of the IP address of the nodes where the given service is installed and put it into the callback.
 * @param {string} service
 * @param {function} callback
 */
function getAllNodesInstalledService(service, callback) {
    getAllPeersValue('meta-data', function(resObj) {
        if (resObj.res) {
            var listIp = [];
            resObj.res.forEach(function(node) {
                if (node.services.indexOf(service) > -1) {
                    listIp.push(node.ip);
                }
            });
            callback({res: listIp});
        }
        else {
            callback({error: resObj.error});
        }
    });
}

/**
 * Sets the view as an "instance variable". The view is set up shortly after the node manager.
 * @param v
 */
function setView(v) {
    view = v;
}

/**
 * Gets monitoring informations from this node and sends them to the websocket.
 * @param {Object} memInfos
 */
function updateMonitoringInfos(memInfos) {
    memInfos.name = localInfos.name;
    gossiper.setLocalState('monitoring', memInfos);
    view.updateClusterInfos('monitoring_' + memInfos.name, memInfos);
}

/**
 * Updates the meta-data in the local state to be shared with the cluster.
 * @param {Object} metaData
 */
function updateMetaData(metaData) {
    gossiper.setLocalState('meta-data', metaData);
}

/**
 * Returns the list of alive peers.
 * @returns {Array}
 */
function livePeers() {
    if (gossiper) {
        return gossiper.livePeers();
    }
    else {
        return [];
    }
}

module.exports.start = start;
module.exports.getAllPeersInfos = getAllPeersInfos;
module.exports.setView = setView;
module.exports.updateMonitoringInfos = updateMonitoringInfos;
module.exports.livePeers = livePeers;
module.exports.getAllPeersMonitoring = getAllPeersMonitoring;
module.exports.updateMetaData = updateMetaData;
module.exports.getAllNodesInstalledService = getAllNodesInstalledService;
