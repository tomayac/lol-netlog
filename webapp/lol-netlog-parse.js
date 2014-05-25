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

// Pull just the CSV data out of the logfile
// Input format is:
// [time], [address], [incoming], [outgoing], [app_ctos], [app_stoc], [loss], [sent], [ping], [variance], [reliable delayed], [unreliable delayed], [app update delayed], [Time spent in critical section (frame)]
// Output: array of row objects.
function parseLolNetlog(data) {
    // TODO: handle disconnects intelligently.
    // See 2014-05-19T17-12-35_netlog.txt
    var result = {};

    // Extract the time stamp
    // Timestamp looks like "2014-05-17T17-19-31:"
    var tsRE = new RegExp("^(\\d+-\\d+-\\d+T\\d+-\\d+-\\d+):")
    var tsMatch = tsRE.exec(data);
    result.ts = moment(tsMatch[1], "YYYY-MM-DDTHH:mm:ss");

    // Extract the time series
    // CSV data starts with a number and a comma
    result.csv = [];
    var csvRE = new RegExp("^\\d+,.*$", "gm");
    var match = null;
    var lastLoss = 0;

    // Loop through lines that look like CSV data
    while (match = csvRE.exec(data)) {
        // Split the row by comma
        var cols = match[0].split(',');
        // Derive the incremental loss in this report
        var cumulativeLoss = +cols[6];
        var incrementalLoss = cumulativeLoss - lastLoss;
        lastLoss = cumulativeLoss;
        // Construct a result object
        result.csv.push({
            time: +cols[0],
            ping: +cols[8],
            cumulativeLoss: +cols[6],
            incrementalLoss: incrementalLoss,
            incoming: +cols[2],
            outgoing: +cols[3]});
    }

    return result;
}
