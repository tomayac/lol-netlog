/* Javascript code to parse League of Legends netlogs.
 *
 * Given a LoL netlog as a string, will parse out useful information
 * such as a time series of pings and packet losses, as well as generate
 * some synthetic and summary stats.
 *
 * This code depends on Moment.js for date parsing. http://momentjs.com/
 *
 * By Nelson Minar <nelson@monkey.org>, available under BSD license.
 */

/* Extract data from a logfile as a multiline text string.
 * Output object format:
 *
 * start: timestamp of the logfile start, a MomentJS object
 * ts: array of timeseries samples from the logfile, converted to numbers where appropriate. Contents:
 *   time: time of logging, milliseconds since game start. Log is typically every 10 seconds
 *   incoming: total bytes sent to client from server
 *   outgoing: total bytes sent from client to server
 *   appCtos: client to server bytes delta excluding overheads (app data only)
 *   appStoc: server to client bytes delta excluding overheads (app data only)
 *   cumulativeLoss: number of packets lost since start
 *   incrementalLoss: number of packets lost since last frame
 *   sent: number of packets sent. (by server? by client? by both?)
 *   ping: LoL client reported ping. Milliseconds, but a 10 second average with some lag info mixed in
 *   variance: how much the ping is changing from avg ping
 *   reliableDelayed: reliable packets dropped from sending this frame because we are sending to much data
 *   unreliableDelayed: unreliable packets dropped from sending this frame because we are sending to much data
 *   appUpdateDelayed: delayed packets because the app is taking to long to run code caused by network packets
 *   criticalTime: Time spent in critical section (frame)
 *   (Note we do not extract address from the logfile; Riot is no longer including useful info for that.)
 */

// TODO: handle disconnects intelligently See 2014-05-19T17-12-35_netlog.txt

/* Given a CSV row from the logfile, parse it out into a nice object.
 * input format is
 * [time], [address], [incoming], [outgoing], [app_ctos], [app_stoc], [loss], [sent], [ping], [variance], [reliable delayed], [unreliable delayed], [app update delayed], [Time spent in critical section (frame)]
 */
function _parseCsvRow(row) {
    // Split the row by comma
    var cols = row.split(',');

    // Parse the fields as numbers and return a labelled object
    return {
        time: +cols[0],
        // address: cols[1],
        incoming: +cols[2],
        outgoing: +cols[3],
        appCtos: +cols[4],
        appStoc: +cols[5],
        cumulativeLoss: +cols[6],
        sent: +cols[7],
        ping: +cols[8],
        variance: +cols[9],
        reliableDelayed: +cols[10],
        unreliableDelayed: +cols[11],
        appUpdateDelayed: +cols[12],
        criticalTime: +cols[13],
    };
}

function parseLolNetlog(data) {
    var result = {};

    // Extract the time stamp
    // Timestamp looks like "2014-05-17T17-19-31:"
    var timestampRE = new RegExp("^(\\d+-\\d+-\\d+T\\d+-\\d+-\\d+):")
    var timestampMatch = timestampRE.exec(data);
    result.start = moment(timestampMatch[1], "YYYY-MM-DDTHH:mm:ss");

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
        row.incrementalLoss = row.cumulativeLoss - lastLoss;
        lastLoss = row.cumulativeLoss;

        // Add it to the time series
        result.ts.push(row);
    }

    return result;
}


// export this for require.js
if (typeof exports == 'undefined'){
    var exports = this['mymodule'] = {};
}
exports._parseCsvRow = _parseCsvRow; // for testing
exports.parseLolNetlog = parseLolNetlog;
