#!/bin/bash

set -eu
rsync -avz \
    webapp/* \
    somebits.com:~nelson/public_html/tmp/lol-netlog/
rsync -avz server somebits.com:/home/nelson/lol-netlog

