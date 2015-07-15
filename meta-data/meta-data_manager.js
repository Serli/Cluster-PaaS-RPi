#!/usr/bin/env node

var config = require('../conf/config');

var logger = require('winston');
logger.level = config.logLevel;

var jsonfile = require('jsonfile');

const file = config.metaDataFile;

var currentMetaDataObj = { services: [] };

jsonfile.readFile(file, function(err, obj) {
    if (err) {
        logger.error('[meta-data_manager] ' + err);
    }
    else {
        currentMetaDataObj = obj;
    }
});

function updateServices(metaDataInfos, callback) {
    if ( metaDataInfos.on ) {
        addService(metaDataInfos.service, callback);
    }
    else {
        removeService(metaDataInfos.service, callback);
    }
}

function addService(service, callback) {
    if ( currentMetaDataObj.services.indexOf( service ) ) {
        currentMetaDataObj.services.push(service);

        jsonfile.writeFile(file, currentMetaDataObj, function (err) {
            if (err) {
                logger.error('[meta-data-manager] ' + err);
                callback(err);
            }
            else {
                callback();
                logger.debug('[meta-data-manager] Service "%s" added to meta-data', service);
            }
        });
    }
    else {
        callback('[meta-data-manager] service "' + service + '" already in meta-data\'s service list');
    }
}

function removeService(service, callback) {
    var index = currentMetaDataObj.services.indexOf(service);
    if (index > -1) {
        currentMetaDataObj.services.splice(index, 1);
    }
    else {
        const errorMessage = '[meta-data-manager] service "' + service + '" not found';
        logger.error(errorMessage);
        callback(errorMessage);
    }

    jsonfile.writeFile(file, currentMetaDataObj, function (err) {
        if (err) {
            logger.error('[meta-data-manager] ' + err);
            callback(err);
        }
        else {
            callback();
            logger.debug('[meta-data-manager] Service "%s" removed from meta-data', service);

        }
    });
}

module.exports.updateServices = updateServices;