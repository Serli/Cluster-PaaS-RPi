# PaaS Cluster of Raspberry Pi

The idea here is to provide a minimum configuration to set up on several RPi's allowing them to **find each others over the network**, **communicate using a reliale gossip protocol** and **detect failures**. We can then deploy distributed systems without having to configure every node one by one. If you want to add a node to the cluster, just copy a configured SD card on a new one.
Most of the code is written in Javascript and runs with NodeJs.

![Cluster informations webpage](./doc/cluster_informations.png)

Let's see the content of each main folder :

- `/gossip` : 
    - **advertisement** protocol runner (based on ZeroConf/Bonjour), used by the RPi's to find each others.
    - **gossip** protocol runner used to ensure a reliable communication between RPi's.
    - **accrual failure detector** using gossip, both are based on [Node-Gossip](https://github.com/bpot/node-gossip) : "based off of academic papers and Cassandra's (http://www.cassandra.org/) implementation of those papers". 

- `/visualisation` : 
    - `/app/http_server.js` contains a http server used by each node to display a webpage on port 8080 containing the following informations about the nodes : name, IP address, port and suspicion rate (Phi factor / threshold)
    - `/app/api.js` contains all the rest API used by the CLI to communicate with the cluster or specific nodes.    

- `/monitoring` : sends monitored informations (cpu, ram, load averages) to gossip and view.

- `/utils` : 
    - `/install/install.sh` : constains the installation shell script used to set up the first SD card. You can then copy the image on other SD cards to get your cluster.
    - `/install/` : files required for the installation :                                         
        - `browser.js` is a little hack to get MDNS working well on Raspberry Pi (cf. [stackoverflow](http://stackoverflow.com/questions/29589543/raspberry-pi-mdns-getaddrinfo-3008-error))
        - `node-manager` is the service allowing to start, stop and restart the node-manager using `sudo service node-manager ...`
    - `/misc/shell_utils.sh` contains a couple of usefull commands
    
- `/conf` : contains a simple configuration file used by the node manager. 

- `/meta-data` : contains the meta-data manager used by the node manager to set and remove meta-data in the local file `~/meta-data.json` (on the node's filesystem).
    
- `/ansible` : 
    - full exemples of distributed deployement in `/playbook` (Nginx webservers and load balancer). The load balancer still has to its IPs hard coded. A simple templating engine may by added to improve deployement simplicity. 
    - a tool that uses a playbook file to generate an Ansible hosts file (`/etc/ansible/hosts`) from the list of Raspberry Pi's found over the network. Launched by `./generate_host_from_playbook.sh your_yml_playbook_file`.
    - a tool to easily change meta-data on a node. Exemple : `./meta-data add-service 192.168.86.121 nginx_webserver`
    - a tool to launch a service on several nodes at a time. It will automatically choose the less busy nodes and run the selected playbook on them. Services need to follow the convention used in `ansible/playbooks`. Exemple of use : `./launch 2 nginx_webserver`.
    - `/ansible/utils` is full of scripts used by the ones explained before.

The node manager starts running `/start_node.js`. By default the projet folder stays in `/home/pi` and is executed by the `node-manager` service **on start up**.
The cluster needs a DHCP service available on the network.

##The REST API

A REST API has been set up in order to provide a CLI (`/ansible`) able to communicate with particular nodes directly. It could also be used to add data on the cluster's informations webpage.

* PUT `/meta-data/add-service/:service` : Add a service to the meta-data of the node (`~/meta-data.json`). Mainly used to avoid running a playbook several times on the same node. 

* PUT `/meta-data/remove-service/:service` : Remove a service to the meta-data of the node (`~/meta-data.json`). Mainly used to avoid running a playbook several times on the same node. 

* GET `/nodes/alive` : Returns an array containing the IP adresses of alive nodes.  
 
* GET `/nodes/monitoring` : Returns all the monitoring informations about all the nodes. 
 
* GET `/nodes/workingService/:service` : Returns an array of objects containing the services installed on each node. 

##How to set up the cluster

First of all, download the last RaspbianOS image [here](https://www.raspberrypi.org/downloads/). 

Copy the image on your SD card (for MacOS) :
* find the SD card : `diskutil list`
* unmount the disk (let's say it's `/dev/disk2`) : `diskutil unmountDisk /dev/disk2`
* copy the image : `sudo dd bs=1m if=/pathTo/2015-02-16-raspbian-wheezy.img | pv | sudo dd of=/dev/disk2`

Then put the SD card in your Raspberry Pi and boot it up. Find it on the network using Nmap (be sure to use the right netmask) : `sudo nmap -sP 192.168.86.0/24 | awk '/^Nmap/{ip=$NF}/B8:27:EB/{print ip}' | tr -d '()'` 

Once you are connected via SSH (by defaut the user is "pi" and the password is "raspberry"), clone this project in the `/home/pi/` of your Rapsberry Pi and set the execution rights to the installation script `./utils/install/install.sh` and run it. This will install every components the node needs to run correctly.

Reboot your Raspberry Pi, wait a minute and you should be able to display a webpage on its port 8080 telling the node is alone on the cluster. If it doesn't work, try to execute the node manager yourself by executing `./start_node.js` and look at what it says.

You can then put back the SD card in your computer and make a copy of the image : `sudo dd bs=1m if=/dev/disk2 | pv | sudo dd of=/pathTo/custom-raspbian-wheezy.dmg`

One you have your custom image of RaspianOS, you can copy it on all SD cards you need to get a nice fully functional cluster !

##Backlog

There are still features to implement in order to get a fully working PaaS cluster of Raspberry Pi. Here is a non-exhaustive list.

###Failure behavior

We are able to detect when a node fails but there is no default behavior to react when it happens. We could imagine a automatic reboot. We should be able to set the threshold on the failure detector depending on the service loaded and set a particular behavior in case of failure.

###Ansible template engine

Ansible playbooks are great but it could be very useful to be able to dynamically personalise the playbook. Taking the exemple of the webservers and load balancer (`/ansible/playbook`), the IP addresses of the webserver are hard coded in the loadbalancer's configuration file. They should be set dynamically.

###Security

There are probably security issues to fix. The most obvious is the fact the Raspberry Pi use there default configuration with default user and password, allowing for anyone on the network to be connected via SSH. Using SSH keys could be a good idea if you don't need to manager the cluster from many clients. Anyway, there are probably several things to work on to get a good security level.