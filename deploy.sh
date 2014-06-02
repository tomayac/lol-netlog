#!/bin/bash

set -eu
rsync -avz --delete \
    webapp/* \
    somebits.com:/var/www/lol-netlog/
rsync -avz --delete server somebits.com:/home/nelson/lol-netlog

