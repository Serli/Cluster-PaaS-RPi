#!/usr/bin/env node

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
