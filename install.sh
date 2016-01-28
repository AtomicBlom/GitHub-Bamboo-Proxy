#!/bin/bash
npm install
useradd -r bamboo-proxy
cp ./install/bamboo-proxy.conf /etc/init/bamboo-proxy.conf
echo Now reboot.