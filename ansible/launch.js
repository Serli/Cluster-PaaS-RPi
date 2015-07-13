#!/usr/bin/env node

const opts = require("nomnom")
    .option('nbInstances', {
        required: true,
        position: 0,
        help: 'Number of instance you want to launch',
        tyme: 'integer'
    })
    .option('service', {
        type: 'string',
        required: true,
        position: 1,
        help: 'Name of the service you want to launch, relative to a folder located in "./playbooks"'
    })
    .parse();

