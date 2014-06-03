#!/usr/bin/python

# Simple script to store data POSTed to it to unique files
# Not bullet proof or scalable, but suitable for a small CGI
# REST nerds will say this should be a PUT.

destDir = '/var/www/lol-netlogs/'

import os, sys, time, contextlib, base64, hashlib

# Do something in reponse to non-POSTs
if os.environ.get("REQUEST_METHOD", None) != "POST":
    print "Content-Type: text/plain"
    print ""
    print "Server supports POST only"
    sys.exit(0)

# Read the POST data. Logs are typically 8-15k.
postdata=sys.stdin.read(100000)
sys.stdin.close()

# Generate a unique filename from a hash of file contents
# A crypto hash is overkill here but it's the best option in stock Python
bn = base64.urlsafe_b64encode(hashlib.md5(postdata).digest()).rstrip('=')
fn = "%s/%s.json" % (destDir, bn)

# Write the data to the file if it's not already there
if not os.path.isfile(fn):
    with contextlib.closing(file(fn, "w")) as fp:
        fp.write(postdata)

# Send back an HTTP response
print 'Content-Type: text/plain'
print 'Access-Control-Allow-Origin: *'
print
print bn

# Exit
sys.exit(0)
