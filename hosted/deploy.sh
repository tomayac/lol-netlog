#!/bin/bash

set -eu
rsync -avz \
    d3.v3.min.js demo.txt moment.min.js netlog.html \
    somebits.com:~nelson/public_html/tmp/lol-netlog/
