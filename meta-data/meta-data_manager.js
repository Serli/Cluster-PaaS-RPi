#!/usr/bin/env node

/**
 * Interface between the main program and the
 */

var config = require('../conf/config');

var logger = require('winston');
logger.level = config.logLevel;

var jsonfile = require('jsonfile');

const file = config.metaDataFile;

var currentMetaDataObj = { services: [] };

/**
 * Reads the meta-data file (~/meta-data.json) and parses the content into a json object.
 */
jsonfile.readFile(file, function(err, obj) {
    if (err) {
        logger.error('[meta-data_manager] ' + err);
    }
    else {
        currentMetaDataObj = obj;
    }
});

function getMetaData() {
    return currentMetaDataObj;
}

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
                const index = currentMetaDataObj.services.indexOf(service);
                currentMetaDataObj.services.splice(index, 1);
                callback(currentMetaDataObj, err);
            }
            else {
                callback(currentMetaDataObj);
                logger.debug('[meta-data-manager] Service "%s" added to meta-data', service);
            }
        });
    }
    else {
        callback(currentMetaDataObj, '[meta-data-manager] service "' + service + '" already in meta-data\'s service list');
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
        callback(currentMetaDataObj, errorMessage);
    }

    jsonfile.writeFile(file, currentMetaDataObj, function (err) {
        if (err) {
            logger.error('[meta-data-manager] ' + err);
            callback(currentMetaDataObj, err);
        }
        else {
            callback(currentMetaDataObj);
            logger.debug('[meta-data-manager] Service "%s" removed from meta-data', service);

        }
    });
}

module.exports.updateServices = updateServices;
module.exports.getMetaData = getMetaData;