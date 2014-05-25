#!/bin/bash

set -eu
rsync -avz \
    webapp/* \
    somebits.com:/var/www/lol-netlog/
rsync -avz server somebits.com:/home/nelson/lol-netlog

