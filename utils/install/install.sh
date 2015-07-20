#!/bin/bash
set -e # automatically exit script if an error occures

cd /home/pi/Cluster-PaaS-RPi

echo '-- Update & Upgrade -'
sudo apt-get update && sudo apt-get upgrade -y

## Node script

echo '-- Node --'
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb
rm node_latest_armhf.deb

echo '-- NPM dependencies --'
echo '--- MDNS ---'
sudo apt-get install -y libavahi-compat-libdnssd-dev
npm install mdns

cp /home/pi/Cluster-PaaS-RPi/utils/install/browser.js /home/pi/Cluster-PaaS-RPi/node_modules/mdns/lib/

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

echo '--- winston ---'
npm install winston

echo '--- jsonfile ---'
npm install jsonfile

echo '--- os-utils ---'
npm install os-utils

echo '--- node-ansible ---'
npm install node-ansible

echo '-- Launch on start up --'
echo '--- Launch on start up ---'
mkdir ~/.forever
sudo npm install forever -g

echo '--- Set up deamon ---'
sudo cp /home/pi/Cluster-PaaS-RPi/utils/install/node-manager /etc/init.d/
sudo chmod +x /etc/init.d/node-manager
sudo update-rc.d node-manager defaults

echo '--- Meta-data file ---'
touch /home/pi/meta-data.json
echo '{"services":[]}' >> /home/pi/meta-data.json
