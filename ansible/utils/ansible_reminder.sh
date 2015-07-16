#!/usr/bin/env bash

# set all peers ip in /etc/ansible/hosts (todo : CLI getting all ip's from nmap or whatever)
vim /etc/ansible/hosts

#[cluster]
#192.168.86.168 ansible_ssh_user=pi
#192.168.86.198 ansible_ssh_user=pi
#192.168.86.121 ansible_ssh_user=pi


# ping all nodes :
#   --ask-pass : because no rsa keys are used
#   --u user   : to specify the user to use for SSH
ansible cluster -m ping --ask-pass

# to run a command on all nodes :
ansible cluster -a "/bin/echo hello" --ask-pass

# to copy files through SCP to several nodes
ansible cluster -m copy -a "src=/etc/hosts dest=/tmp/hosts" --ask-pass

# from git
ansible cluster -m git -a "repo=git://foo.example.org/repo.git dest=/srv/myapp version=HEAD" --ask-pass

# run a playbook
ansible-playbook uninstall_distributed_nginx.yml --ask-pass