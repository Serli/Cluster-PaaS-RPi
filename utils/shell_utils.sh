# Find the RPi's over the network
sudo nmap -sP 192.168.86.0/24 | awk '/^Nmap/{ip=$NF}/B8:27:EB/{print ip}' | tr -d '()'

# Install a Rapsian on a SD card
sudo dd bs=1m if=/Users/julienderay/Serli/Cluster-RPI/2015-02-16-raspbian-wheezy.img | pv | sudo dd of=/dev/disk2