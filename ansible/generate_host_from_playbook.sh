#!/usr/bin/env bash

command=$0
if [ ${command:0:2} == "./" ]
then
    mkdir tmp 2>/dev/null

    echo "Extracting hosts from playbook ..."
    utils/get_hosts_from_yml.js ../$1 > tmp/groups

    echo "Looking for Raspberry Pi's via Nmap (will ask for sudo password) ..."
    utils/get_simple_host_file.sh > tmp/brut_hosts

    # populates the hosts_arrangement file's first line with host groups
    nbGroups=0
    for group in $(cat tmp/groups)
    do
      echo -n "${group};" >> tmp/hosts_arrangement
      nbGroups=$((nbGroups+1))
    done

    echo " " >> tmp/hosts_arrangement

    # ask for the ip -> host repartition
    for host in $(cat tmp/brut_hosts)
    do
        printf "\nChoose in which group you want to put this Raspberry pi : ${host}\n"

        i=0
        for group in $(cat tmp/groups)
        do
          echo "[${i}] : ${group}"
          i=$((i+1))
        done

        chosenGroup=100000
        while (( chosenGroup > (nbGroups - 1) ))
        do
            read -n 1 -p "Group : " chosenGroup
        done
        echo -n "${host}=${chosenGroup};" >> tmp/hosts_arrangement
    done

    utils/generate_hosts_from_arrangement.js ../tmp/hosts_arrangement

    rm -rf tmp
else
    echo 'Please make sure you are running this script in its own directory (command starting by "./")'
fi


