var serverPort = 8002;
var destDir = '/tmp/nl/';

var express = require('express'),
    uuid = require('node-uuid'),
    fs = require('fs'),
    getRawBody = require('raw-body'),
    murmurHash3 = require("murmurhash3js");

var app = express();

// Handle GET /
app.get('/', function(req, res) {
    res.set('Content-Type', 'text/plain');
    res.send("Server supports POST only\n");
});

// Middleware to read POST bodies
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

// Generate a filename for the content
function fnForLog(data) {
    // 64 bit content hash; should be sufficient for collisions
    return murmurHash3.x64.hash128(data).substr(0, 16);
}

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

var server = app.listen(serverPort, function() {
    console.log('Listening on port %d', server.address().port);
});

