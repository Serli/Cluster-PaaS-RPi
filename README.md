# PaaS Cluster of Raspberry Pi's

The idea here is to provide a minimum configuration to set up on several RPi's allowing them to **find each others over the network**, **communicate using a reliale gossip protocol** and **detect failures**. We can then deploy distributed systems without having to configure every node one by one. If you want to add a node to the cluster, just copy a configured SD card on a new one.
Most of the code is written in Javascript and runs with NodeJs.

Let's see the content of each main folder :

- `/gossip` : 
    - **advertisement** protocol runner (based on ZeroConf/Bonjour), used by the RPi's to find each others.
    - **gossip** protocol runner used to ensure a reliable communication between RPi's.
    - **accrual failure detector** using gossip, both are based on [Node-Gossip](https://github.com/bpot/node-gossip) : "based off of academic papers and Cassandra's (http://www.cassandra.org/) implementation of those papers". 

- `/visualisation` : contains a http server used by each node to display a webpage on port 8080 containing the following informations about the nodes : name, IP address, port and suspicion rate (Phi factor / threshold)

- `utils` : 
    - `install.sh` : the installation shell script used to set up the first SD card. You can then copy the content on other SD cards to get your cluster.
    - files required for the installation :                                         
        - `browser.js` is a little hack to get MDNS working well on Raspberry Pi (cf. [stackoverflow](http://stackoverflow.com/questions/29589543/raspberry-pi-mdns-getaddrinfo-3008-error))
        - `node-manager` is the service allowing to start, stop and restart the node-manager using `sudo service node-manager ...`
    - `shell_utils` contains a couple of usefull commands
    
- `ansible` : contains a full exemple of distributed deployement in `/playbook` (Nginx webservers and load balancer) and a tool that uses a playbook file to generate an Ansible hosts file (`/etc/ansible/hosts`) from the list of Raspberry Pi's found over the network.

The node manager is started by `/start_node.js` in root folder. By default the projet folder stays in `/home/pi` and is executed by the `node-manager` service **on start up**.
The cluster needs a DHCP service available on the network.