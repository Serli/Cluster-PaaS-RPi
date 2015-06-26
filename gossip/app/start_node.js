#!/usr/bin/env node
var advertisement = require('../core/advertisement');
var view = require('../../visualisation');
var gossip_manager = require('./gossip_manager');

var ip = require("ip");
const node_addr = ip.address();

var node_launched = false;

const node_name = require('../core/name_picker').get_node_name();
console.log('>>> node name is :', node_name);

advertisement.start(node_name);
search_node_and_connect();

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

function start_node(node_ip) {
    const node_port = 9000;
    var addr = [node_ip, node_port].join(':');

    console.log('Connecting to node', addr);

    gossip_manager.start(node_ip, node_port, node_name, function(g) {
        node_launched = true;
        console.log('Node', node_port, 'started');

        view.start_http_server(node_addr, g);
        return view;
    });
}