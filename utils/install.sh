#!/bin/bash

echo '-- Update & Upgrade -'
sudo apt-get update && sudo apt-get upgrade

## Node script

echo '-- Node --'
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb
rm node_latest_armhf.deb

echo '-- NPM dependencies --'
echo '--- MDNS ---'
sudo apt-get install libavahi-compat-libdnssd-dev
npm install mdns

echo '--- Nomnom ---'
npm install nomnom

echo '--- Msgpack ---'
npm install msgpack

