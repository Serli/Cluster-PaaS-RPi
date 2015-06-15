# trouver les pi du réseau
sudo nmap -sP 192.168.86.0/24 | awk '/^Nmap/{ip=$NF}/B8:27:EB/{print ip}'

# installer une raspbian
sudo dd bs=1m if=/Users/julienderay/Serli/Cluster-RPI/2015-02-16-raspbian-wheezy.img | pv | sudo dd of=/dev/disk2