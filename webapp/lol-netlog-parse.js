"use strict";

/* Javascript code to parse League of Legends netlogs.
 * http://logsoflag.com/
 *
 * Given a LoL netlog as a string, will parse out useful information
 * such as a time series of pings and packet losses, as well as generate
 * some synthetic and summary stats.
 *
 * This code depends on Moment.js for date parsing. http://momentjs.com/
 *
 * Copyright (c) 2014 Daedalus Bits, LLC. Available under BSD license.
 * By Nelson Minar <nelson@monkey.org>
 */


/* TODO
 * handle disconnects intelligently See 2014-05-19T17-12-35_netlog.txt
 * test with non-US clients
 */

/* Extract data from a logfile as a multiline text string.
 * Output object format:
 *
 * valid: boolean, is it a valid logfile?
 * start: timestamp of the logfile start, a MomentJS object
 * tsColumns: documentation string for ths ts row format.
 * ts: array of timeseries samples from the logfile, converted to numbers where appropriate.
 * Each row in the ts array is one CSV sample, itself an array with the following parameters:
 *   0: time: time of logging, milliseconds since game start. Log is typically every 10 seconds
 *   1: incoming: total bytes sent to client from server
 *   2: outgoing: total bytes sent from client to server
 *   3: appCtos: client to server bytes delta excluding overheads (app data only)
 *   4: appStoc: server to client bytes delta excluding overheads (app data only)
 *   5: cumulativeLoss: number of packets lost since start
 *   6: sent: number of packets sent. (by server? by client? by both?)
 *   7: ping: LoL client reported ping. Milliseconds, but a 10 second average with some lag info mixed in
 *   8: variance: how much the ping is changing from avg ping
 *   9: reliableDelayed: reliable packets dropped from sending this frame because we are sending to much data
 *   10: unreliableDelayed: unreliable packets dropped from sending this frame because we are sending to much data
 *   11: appUpdateDelayed: delayed packets because the app is taking to long to run code caused by network packets
 *   12: criticalTime: Time spent in critical section (frame)
 *   13: incrementalLoss: number of packets lost since last frame
 *   (Note we do not extract address from the logfile; Riot is no longer including useful info for that.)
 *
 * Note that these numbers are as documented in the netlog files, but it appears appCtos and appStoc are swapped.
 */
function parseLolNetlog(data) {
    var result = { 'valid': false };

    // Extract the time stamp from the first line.
    // Timestamp looks like "2014-05-17T17-19-31" or "Fri May 24 16:19:23 2013"
    var timestampRE = /^(\d+-\d+-\d+T\d+-\d+-\d+)|(\w\w\w \w\w\w \d\d \d\d:\d\d:\d\d \d\d\d\d): LogOut_File: : logfile started/;
    var timestampMatch = timestampRE.exec(data);
    if (!timestampMatch) {
        return result;
    }
    result.start = (timestampMatch[1] ?
                      moment(timestampMatch[1], "YYYY-MM-DDTHH:mm:ss") :
                      moment(timestampMatch[2].substr(4), "MMM D HH:mm:ss YYYY"));

    // Document the time series format. Maybe someday we can make a class to give object-style access.
    result.tsColumns = ["time", "incoming", "outgoing", "app_ctos", "app_stoc", "loss", "sent", "ping", "variance", "reliable delayed", "unreliable delayed", "app update delayed", "Time spent in critical section (frame)", "incremental loss"];

    // Extract the time series. Lines look like this:
    // 56850,X.X.X.X,18037,3613,3045,580,1,113,73,49,0,0,7,0
    // CSV data starts with a number and a comma
    result.ts = [];
    var csvRE = new RegExp("^\\d+,.*$", "gm");
    var match = null;
    var lastLoss = 0;

    // Loop through lines that look like CSV data
    while (match = csvRE.exec(data)) {
        // Parse the row
        var row = _parseCsvRow(match[0]);

        // Derive the incremental loss in this report
        row[13] = row[5] - lastLoss;
        lastLoss = row[5];

        // Add it to the time series
        result.ts.push(row);
    }

    result.valid = true;
    return result;
}

/* Load a parsed netlog record from a string containing JSON data.
 * Mostly a wrapper for JSON.parse(), but also adds useful types
 * for .start.
 * TODO: consider a nicer API for the rows as well.
 */
function loadFromJson(jsonText) {
    var r = JSON.parse(jsonText);
    r.start = moment(r.start);
    return r;
}

/* Given a CSV row from the logfile, parse it out into an integer array.
 * input format is
 * [time], [address], [incoming], [outgoing], [app_ctos], [app_stoc], [loss], [sent], [ping], [variance], [reliable delayed], [unreliable delayed], [app update delayed], [Time spent in critical section (frame)]
 */
function _parseCsvRow(row) {
    // Split the row by comma
    var cols = row.split(',');

    // Parse the fields as numbers and return an array
    return [
        +cols[0],
        // cols[1] is the server address, no longer meaningful
        +cols[2],
        +cols[3],
        +cols[4],
        +cols[5],
        +cols[6],
        +cols[7],
        +cols[8],
        +cols[9],
        +cols[10],
        +cols[11],
        +cols[12],
        +cols[13],
    ];
}

// Stuff required to run in Node.js environment
if (typeof exports != 'undefined') {
    var moment = require('moment');
    exports._parseCsvRow = _parseCsvRow; // for testing
    exports.parseLolNetlog = parseLolNetlog;
    exports.loadFromJson = loadFromJson;
}
