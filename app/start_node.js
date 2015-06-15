#!/usr/bin/env node
var advertisement = require('../core/advertisement');

var opts = require("nomnom")
    .script("start_cluster_node")
    .options({
        name: {
            position: 0,
            required: true,
            help: "Node's name"
        }
    }).parse();

advertisement.start(opts.name);
search_node_and_connect();

function search_node_and_connect() {
    advertisement.search_a_node(function (service) {
        console.log('Node found :');
        console.log('   IP :', service.addresses);
        console.log('   Host :', service.host);
        console.log('   Name :', service.txtRecord.cluster_name);

        start_node(service.host);

        console.log('Stop looking for nodes');
        advertisement.stop_searching();

        advertisement.start(opts.name);
    });
}

function start_node(host) {
    var node_port = 9001;
    var seed_port = 9000;
    var addr = [host, seed_port].join(':');

    var Gossiper = require('../lib/node-gossip').Gossiper;

    var g;
    if ( host ) {
        console.log('Connecting to node', addr);
        g = new Gossiper(node_port, [addr]);
    }
    else {
        g = new Gossiper(node_port, []);
    }

    g.on('new_peer', function(peer_name) {
        console.log('New peer :', peer_name);
    });

    g.on('peer_alive', function(peer_name) {
        console.log('Peer alive :', peer_name);
    });

    g.on('peer_failed', function(peer_name) {
        console.log('Peer_failed :', peer_name);
    });

    g.start();
    console.log('Node', node_port, 'started');
}
