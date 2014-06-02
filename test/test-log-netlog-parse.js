var should = require('chai').should();
var fs = require('fs');
var moment = require('moment');
var parse = require("../webapp/lol-netlog-parse")

describe('lol-netlog-parse', function() {
    var goodGameString, goodGameData;
    var oldFormatData;

    before(function(done) {
        fs.readFile('test/good-game.txt', 'utf-8', function(err, data) {
            data.should.have.length(11739);
            goodGameString = data;
            goodGameData = parse.parseLolNetlog(goodGameString);
            done();
        });
    });
    before(function(done) {
        fs.readFile('test/2013-format.txt', 'utf-8', function(err, data) {
            oldFormatData = parse.parseLolNetlog(data);
            done();
        });
    });

    describe('_parseCsvRow', function() {
        it('Should parse a sample row', function() {
            var result = parse._parseCsvRow('106951,X.X.X.X,48277,8397,4553,580,3,204,45,8,0,0,7,0');
            result.should.deep.equal([106951,48277,8397,4553,580,3,204,45,8,0,0,7,0]);
        });
    });

    describe('parseLolNetlog', function() {
        it('Should be valid on valid input', function() {
            goodGameData.should.have.property('valid', true);
            oldFormatData.should.have.property('valid', true);
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
        it('Should parse the time stamp for old formats', function() {
            oldFormatData.start.year().should.equal(2013);
            oldFormatData.start.month().should.equal(5-1);
            oldFormatData.start.date().should.equal(24);
            oldFormatData.start.hour().should.equal(16);
            oldFormatData.start.minute().should.equal(19);
            oldFormatData.start.second().should.equal(23);
        });
        it('Should have the right number of rows in the ts', function() {
            goodGameData.ts.should.have.length(154);
        });
        it('Should have a doc string with the right number of items', function() {
            goodGameData.tsColumns.should.have.length(goodGameData.ts[0].length);
        });
        it('Should have correct incremental loss statistics', function() {
            console.log(goodGameData.ts[22]);
            goodGameData.ts[21][5].should.equal(1);
            goodGameData.ts[22][5].should.equal(2);
            goodGameData.ts[23][5].should.equal(2);
            goodGameData.ts[22][13].should.equal(1);
            goodGameData.ts[23][13].should.equal(0);
        });
    });
});
