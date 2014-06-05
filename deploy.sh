#!/bin/bash

set -eu

rsync -avz --delete \
    webapp/{bg.jpg,*.html,*.js,*.css} \
    somebits.com:/var/www/lol-netlog/

rsync -avzR --delete \
    server logToJson.js webapp/lol-netlog-parse.js \
    somebits.com:/home/nelson/lol-netlog
