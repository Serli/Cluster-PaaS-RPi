var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('rpi-node'), {networkInterface: require('../../conf/config').interface});

module.exports = {
    start : function(nodeName) {
        var mdns = require('mdns');

        var infos = {
            clusterName: nodeName
        };

        var ad = mdns.createAdvertisement(mdns.tcp('rpi-node'), 9999, {txtRecord: infos});

        console.log('Starting advertisement on port', 9999);
        ad.start();
    },

    searchOneNode : function(callback) {
        console.log('Start looking for nodes');

        browser.on('serviceUp', callback);

        browser.start();
    },

    stopSearching : function() {
        browser.stop();
    }
};
