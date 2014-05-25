var should = require('chai').should();
var fs = require('fs');
var moment = require('moment');
var parse = require("../webapp/lol-netlog-parse")

describe('lol-netlog-parse', function() {
    var goodGameString;
    var goodGameData;

    before(function(done) {
        fs.readFile('test/good-game.txt', 'utf-8', function(err, data) {
            data.should.have.length(11739);
            goodGameString = data;
            goodGameData = parse.parseLolNetlog(goodGameString);
            done();
        });
    });

    describe('_parseCsvRow', function() {
        it('Should parse a sample row', function() {
            var result = parse._parseCsvRow('106951,X.X.X.X,48277,8397,4553,580,3,204,45,8,0,0,7,0');
            result.should.have.property('time', 106951);
            result.should.have.property('incoming', 48277);
            result.should.have.property('outgoing', 8397);
            result.should.have.property('appCtos', 4553);
            result.should.have.property('appStoc', 580);
            result.should.have.property('cumulativeLoss', 3);
            result.should.have.property('sent', 204);
            result.should.have.property('ping', 45);
            result.should.have.property('variance', 8);
            result.should.have.property('reliableDelayed', 0);
            result.should.have.property('unreliableDelayed', 0);
            result.should.have.property('appUpdateDelayed', 7);
            result.should.have.property('criticalTime', 0);
        });
    });

    describe('parseLolNetlog', function() {
        it('Should be valid on valid input', function() {
            goodGameData.should.have.property('valid', true);
        });
        it('Should be invalid on invalid input', function() {
            parse.parseLolNetlog('').should.have.property('valid', false);
            parse.parseLolNetlog('foobar').should.have.property('valid', false);
        });
        it('Should parse the time stamp', function() {
            goodGameData.start.year().should.equal(2014);
            goodGameData.start.month().should.equal(5-1);
            goodGameData.start.date().should.equal(23);
            goodGameData.start.hour().should.equal(17);
            goodGameData.start.minute().should.equal(44);
            goodGameData.start.second().should.equal(9);
        });
        it('Should have the right number of rows in the ts', function() {
            goodGameData.ts.should.have.length(154);
        });
    });
});
