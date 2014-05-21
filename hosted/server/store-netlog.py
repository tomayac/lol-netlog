#!/usr/bin/python

# Simple script to store data POSTed to it to unique files
# Not bullet proof or scalable, but suitable for a small CGI
# REST nerds will say this should be a PUT.

destDir = '/home/nelson/lol-netlog/logs'

import os, sys, time, contextlib

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
ip = os.environ.get('REMOTE_ADDR', '?.?.?.?')
fn = "%s/%s-%s-%s" % (destDir,time.time(), os.getpid(), ip)

# Write the data to the file
with contextlib.closing(file(fn, "w")) as fp:
    fp.write(postdata)

# Send back an HTTP response
print 'Content-Type: text/plain'
print 'Access-Control-Allow-Origin: *'
print
print 'OK %d bytes' % len(postdata)

# Exit
sys.exit(0)
