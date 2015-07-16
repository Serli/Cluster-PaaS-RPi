#!/usr/bin/env bash

# Performs a Nmap scan across the network the find Raspberry Pi with there MAC address.

sudo nmap -sP 192.168.86.0/24 | awk '/^Nmap/{ip=$NF}/B8:27:EB/{print ip}' | tr -d '()'
