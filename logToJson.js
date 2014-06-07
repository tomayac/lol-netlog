#!/usr/bin/env node

/* A simple command line script to convert a logfile to our JSON format.
 * Output does not include the "raw" field with the log text itself.
 */

var parse = require("./webapp/lol-netlog-parse.js");

process.stdin.setEncoding('utf8');

// Read the whole log into a buffer
var logChunks = [];
process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        logChunks.push(chunk);
    }
});

// Once log is read, print it out
process.stdin.on('end', function() {
    var log = logChunks.join();
    var parsed = parse.parseLolNetlog(log);
    process.stdout.write(JSON.stringify(parsed));
});

