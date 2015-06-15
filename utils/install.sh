#!/bin/bash

echo '-- Update & Upgrade -'
sudo apt-get update && sudo apt-get upgrade

## Basic installation

echo "-- DHCP server installation --"
sudo apt-get install isc-dhcp-server

cat <<EOM > dhcpd.conf
ddns-update-style none;
default-lease-time 86400;
max-lease-time 604800;
authoritative;
subnet 192.168.0.0 netmask 255.255.255.0 {
range 192.168.0.10 192.168.0.20;
option subnet-mask 255.255.255.0;
option broadcast-address 192.168.0.255;
option routers 192.168.0.1;
}
EOM

sudo mv dhcpd.conf /etc/dhcp/dhcpd.conf
sudo update-rc.d isc-dhcp-server start

echo '========================='
echo '= You should reboot now ='
echo '========================='

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

