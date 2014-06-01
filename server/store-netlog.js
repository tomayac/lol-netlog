// Module imports
var express = require('express'),
    uuid = require('node-uuid'),
    fs = require('fs'),
    getRawBody = require('raw-body'),
    murmurHash3 = require("murmurhash3js");

// Build the application server
var app = express();


// Server configuration
var serverPort = 8002,
    destDir = '/tmp/nl/';

if ('production' == app.get('env')) {
    destDir = '/var/www/lol-netlogs/';
} else {
    console.log('Running in development mode');
}

// Enable CORS on requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Install middleware to read POST bodies
app.use(function (req, res, next) {
    getRawBody(req, {
        length: req.headers['content-length'],
        limit: '1mb',
        encoding: 'utf8'
    }, function (err, string) {
        if (err)
            return next(err);    // does this leak? see docs
        req.text = string;
        next();
    })
});


// Code to generate a filename based on uploaded content
function fnForLog(data) {
    // 64 bit content hash; should be sufficient for collisions
    return murmurHash3.x64.hash128(data).substr(0, 16);
}


// Handle GET /
app.get('/', function(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send("Server supports POST only\n");
});

// Handle POST / (should be PUT?)
app.post('/', function(req, res) {
    // TODO: handle too-large input more gracefully
    var postData = req.text;

    var bn = fnForLog(postData);
    var fn = destDir + '/' + bn;

    fs.exists(fn, function(exists) {
        if (!exists) {
            fs.writeFile(fn, postData, function(err) {
                if (err) throw err;
            });
    }});

    res.set('Content-Type', 'text/plain');
    res.set('Access-Control-Allow-Origin: *');
    res.send(bn);
});


// And listen on the port
var server = app.listen(serverPort, function() {
    console.log('Listening on %s:%s writing to %s', server.address().address, server.address().port, destDir);
});

