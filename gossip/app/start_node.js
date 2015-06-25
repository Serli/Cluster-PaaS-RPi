#!/usr/bin/env node
var advertisement = require('../core/advertisement');
var Gossiper = require('../lib/node-gossip').Gossiper;
var view = require('../../visualisation');

var ip = require("ip");
const node_addr = ip.address();

var node_launched = false;

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

view.start_http_server(node_addr);

function search_node_and_connect() {
    advertisement.search_a_node(function (service) {
        if ( service.addresses.indexOf( node_addr ) < 0 && !node_launched) {
            console.log('Node found :');
            console.log('   IP :', service.addresses);
            console.log('   Host :', service.host);
            console.log('   Name :', service.txtRecord.cluster_name);

            console.log('Stop looking for nodes');
            advertisement.stop_searching();

            start_node(service.addresses[0]);
        }
    });
}

function start_node(host) {
    const node_port = 9000;
    var addr = [host, node_port].join(':');

    console.log('Connecting to node', addr);
    var g = new Gossiper(node_port, [addr]);

    g.on('new_peer', function(peer_name) {
        view.update_cluster_infos('new_peer', peer_name);
    });

    g.on('peer_alive', function(peer_name) {
        view.update_cluster_infos('peer_alive', peer_name);
    });

    g.on('peer_failed', function(peer_name) {
        view.update_cluster_infos('peer_failed', peer_name);
    });

    g.on('update', function(peer_name, key, value) {
        console.log("peer " + peer_name + " set " + key + " to " + value);
    });

    g.start();
    node_launched = true;
    console.log('Node', node_port, 'started');

    setLocals(g, node_port);
}

function setLocals(g, node_port) {
    g.setLocalState('name', opts.name);
    g.setLocalState('port', node_port);
    g.setLocalState('ip', node_addr);
}