#!/bin/bash

if [[ "$EUID" -eq 0 ]]; then
    echo 'launch-node-server will not run as root'
    exit 1;
fi

export NODE_ENV=production
node store-netlog.js >> /var/log/lol-netlog.log 2>&1 &
