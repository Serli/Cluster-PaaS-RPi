#!/usr/bin/env node

/**
 * Parses the playbook file given in argument, extracts the hosts and returns them by the standard output. It is read by generate_host_from_playbook.sh.
 */

var yaml = require('yamljs');

const opts = require("nomnom")
    .script("get_hosts_from_yml")
    .options({
        playbook: {
            position: 0,
            required: true,
            help: "Playbook to run"
        }
    }).parse();


jsonPlaybook = yaml.load(__dirname + '/' + opts.playbook);
const hosts = jsonPlaybook.map(function(play) {
    return play.hosts;
});

hosts.forEach(function(host) {
    console.log(host);
});
