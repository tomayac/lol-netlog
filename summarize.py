#!/usr/bin/env python

import re, sys, optparse, os.path

from optparse import OptionParser
op = OptionParser()
op.add_option("-s", "--short", default=False, action="store_true")
(options, files) = op.parse_args()

dataRE = re.compile('^\d+,')

def parse(fn):
    data = []
    fp = file(fn)

    # Parse time series row
    for l in fp:
        if dataRE.match(l):
            p = l.strip().split(',')
            # Game crashes result in truncated logs
            if len(p) != 14:
                return None
            for i, d in enumerate(p):
                if (i != 1):
                    p[i] = int(d)
            data.append(p)
    return data

def packetLossTS(data):
    # Print loss notes
    lastLoss = 0
    print "Lost packets every 10 seconds: ",
    for row in data:
        ts, ip, inc, out, ctos, stoc, loss, sent, ping, pingVar, relDel, unrelDel, appDel, time = row
        print (loss - lastLoss),
        lastLoss = loss
    print

def summary(data):
    # Summarize based on last line
    ts, ip, inc, out, ctos, stoc, loss, sent, ping, pingVar, relDel, unrelDel, appDel, time = data[-1]

    matchLength = ts/1000
    if not options.short:
        print "%d minutes on server %s" % (matchLength/60, ip)
        print "%d bytes/s in, %d bytes/s out" % (inc/(matchLength), out/(matchLength))
    print "%d packets lost: %.2f packets/s" % (loss, float(loss)/(matchLength))

for fn in files:
    data = parse(fn)
    if data:
        print os.path.basename(fn),
        if not options.short:
            print
            packetLossTS(data)
        summary(data)
        if not options.short:
            print


