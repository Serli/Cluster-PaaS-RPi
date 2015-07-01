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

mv ./browser.js ~/node_modules/mdns/lib/

echo '--- Msgpack ---'
npm install msgpack

echo '--- IP ---'
npm install ip

echo '--- socket.io ---'
npm install socket.io

echo '--- jade ---'
npm install jade

echo '--- express ---'
npm install express

echo '--- macaddress ---'
npm install macaddress


echo '-- Launch on start up --'
echo '--- Launch on start up ---'
mkdir ~/.forever
sudo npm install forever -g

echo '--- Set up deamon ---'
sudo cp /home/pi/Cluster-PaaS-RPi/utils/node-manager /etc/init.d/
sudo chmod +x /etc/init.d/node-manager
sudo update-rc.d node-manager defaults