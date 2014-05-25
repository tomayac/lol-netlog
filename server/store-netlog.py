#!/usr/bin/python

# Simple script to store data POSTed to it to unique files
# Not bullet proof or scalable, but suitable for a small CGI
# REST nerds will say this should be a PUT.

destDir = '/var/www/lol-netlogs/'

import os, sys, time, contextlib, uuid

# Do something in reponse to non-POSTs
if os.environ.get("REQUEST_METHOD", None) != "POST":
    print "Content-Type: text/plain"
    print ""
    print "Server supports POST only"
    sys.exit(0)

# Read the POST data. Logs are typically 8-15k.
postdata=sys.stdin.read(100000)
sys.stdin.close()

# Generate a unique filename
bn = uuid.uuid4().hex
fn = "%s/%s" % (destDir, bn)

# Write the data to the file
with contextlib.closing(file(fn, "w")) as fp:
    fp.write(postdata)

# Send back an HTTP response
print 'Content-Type: text/plain'
print 'Access-Control-Allow-Origin: *'
print
print bn

# Exit
sys.exit(0)
