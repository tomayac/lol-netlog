#!/bin/bash

set -eu

rsync -avz --delete \
    webapp/{*.html,*.js,*.css,*.png,*.jpg,favicon.ico} \
    somebits.com:/var/www-logsoflag/

rsync -avzR --delete \
    server logToJson.js webapp/lol-netlog-parse.js \
    somebits.com:/home/nelson/lol-netlog
