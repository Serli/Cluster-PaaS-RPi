var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('rpi-node'), {networkInterface: 'en0'});

module.exports = {
    start : function(node_name) {
        var mdns = require('mdns');

        var infos = {
            cluster_name: node_name
        };

        var ad = mdns.createAdvertisement(mdns.tcp('rpi-node'), 9999, {txtRecord: infos});

        console.log('Starting advertisement on port', 9999);
        ad.start();
    },

    search_a_node : function(callback) {
        console.log('Start looking for nodes');

        browser.on('serviceUp', callback);

        browser.start();
    },

    stop_searching : function() {
        browser.stop();
    }
};
