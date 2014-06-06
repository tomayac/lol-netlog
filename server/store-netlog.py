#!/usr/bin/python

# Simple script to store data POSTed to it to unique files
# Not bullet proof or scalable, but suitable for a small CGI
# REST nerds will say this should be a PUT.

jsonDestDir = '/var/www-logsoflag/logs/'
rawDestDir = '/var/local/lol-netlogs/'

import os, sys, time, contextlib, base64, hashlib

def writeFile(data, dir, fn):
    "Safely write data to a file if it's not already there"
    if "/" in fn:   # not complete, but can't hurt
        raise "No slashes in filenames"
    pn = "%s/%s" % (dir, fn)
    if not os.path.isfile(pn):
        with contextlib.closing(file(pn, "w")) as fp:
            fp.write(data)

# Do something in reponse to non-POSTs
if os.environ.get("REQUEST_METHOD", None) != "POST":
    print "Content-Type: text/plain"
    print ""
    print "Server supports POST only"
    sys.exit(0)

# Read the POST data. Logs are typically 8-15k.
postdata=sys.stdin.read(1500000)
sys.stdin.close()

# Split the input based on the delimeter
try:
    jsonText, rawText = postdata.split(u'\u001c')
except:
    jsonText = '{"valid":false}'
    rawText = postdata

# Generate a unique id for the log from a hash of file contents
# A crypto hash is overkill here but it's the best option in stock Python
logId = base64.urlsafe_b64encode(hashlib.md5(rawText).digest())[:11]

# Write the JSON and the raw log to files
writeFile(jsonText, jsonDestDir, "%s.json" % logId)
writeFile(rawText, rawDestDir, logId)

# Send back an HTTP response
print 'Content-Type: text/plain'
print 'Access-Control-Allow-Origin: *'
print
print logId

# Exit
sys.exit(0)
